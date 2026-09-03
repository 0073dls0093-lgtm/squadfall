use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount, Transfer};

declare_id!("SQLD111111111111111111111111111111111111111");

// ============================================================
// CONSTANTS
// ============================================================

/// Max token supply: 500 million SQUAD (9 decimals)
pub const MAX_SUPPLY: u64 = 500_000_000 * 1_000_000_000;

/// Reward pool: 40% of supply = 200 million
pub const REWARD_POOL_TOTAL: u64 = 200_000_000 * 1_000_000_000;

/// Total phases in the game
pub const TOTAL_PHASES: u8 = 30;

/// Cooldown between same-phase replays (seconds)
pub const PHASE_COOLDOWN: i64 = 1800; // 30 minutes

/// Daily phase completion limit per wallet
pub const DAILY_LIMIT: u8 = 50;

/// Staking required for World 3+
pub const STAKE_WORLD_3: u64 = 100 * 1_000_000_000;
pub const STAKE_WORLD_4: u64 = 250 * 1_000_000_000;
pub const STAKE_WORLD_5: u64 = 500 * 1_000_000_000;

/// Staking unlock period (seconds)
pub const STAKE_UNLOCK_PERIOD: i64 = 7 * 24 * 60 * 60; // 7 days

// ============================================================
// PHASE REWARDS (base, 1-star)
// ============================================================

/// Returns the base reward for a given phase_id (1..30)
pub fn get_phase_reward(phase_id: u8) -> u64 {
    match phase_id {
        1..=6   => 10_000_000_000,   // World 1: 10 SQUAD
        7..=12  => 25_000_000_000,   // World 2: 25 SQUAD
        13..=18 => 50_000_000_000,   // World 3: 50 SQUAD
        19..=24 => 100_000_000_000,  // World 4: 100 SQUAD
        25..=30 => 250_000_000_000,  // World 5: 250 SQUAD
        _ => 0,
    }
}

/// World for a phase
pub fn get_world(phase_id: u8) -> u8 {
    ((phase_id - 1) / 6) + 1
}

// ============================================================
// ACCOUNTS
// ============================================================

#[account]
pub struct GameState {
    pub authority: Pubkey,           // Game admin (reward signer)
    pub squad_mint: Pubkey,          // $SQUAD token mint
    pub reward_vault: Pubkey,        // Token account holding rewards
    pub total_rewards_claimed: u64,  // Lifetime rewards distributed
    pub bump: u8,
}

#[account]
pub struct PlayerState {
    pub owner: Pubkey,               // Player's wallet
    pub total_phases_completed: u32, // How many unique phases done
    pub total_tokens_earned: u64,    // Lifetime SQUAD earned
    pub daily_completions: u8,       // Phase completions today
    pub last_daily_reset: i64,       // Timestamp of last daily reset
    pub reserved: [u8; 64],          // Reserved for future
    pub bump: u8,
}

#[account]
pub struct PhaseCompletion {
    pub player: Pubkey,           // Player wallet
    pub phase_id: u8,             // Which phase (1..30)
    pub stars: u8,                // Stars earned (1..3)
    pub completed_at: i64,        // Timestamp
    pub replay_count: u8,         // How many replays
    pub last_replay_at: i64,      // Last replay timestamp
    pub bump: u8,
}

#[account]
pub struct StakeAccount {
    pub owner: Pubkey,
    pub amount: u64,
    pub staked_at: i64,
    pub unlock_requested_at: Option<i64>,
    pub bump: u8,
}

// ============================================================
// INSTRUCTIONS
// ============================================================

#[program]
pub mod squad_fall {

    use super::*;

    // ------------------------------------------------
    // Initialize the game state (admin only)
    // ------------------------------------------------
    pub fn initialize_game(
        ctx: Context<InitializeGame>,
        game_state_bump: u8,
    ) -> Result<()> {
        let state = &mut ctx.accounts.game_state;
        state.authority = ctx.accounts.authority.key();
        state.squad_mint = ctx.accounts.squad_mint.key();
        state.reward_vault = ctx.accounts.reward_vault.key();
        state.total_rewards_claimed = 0;
        state.bump = game_state_bump;
        Ok(())
    }

    // ------------------------------------------------
    // Initialize a player's state account
    // ------------------------------------------------
    pub fn initialize_player(
        ctx: Context<InitializePlayer>,
        bump: u8,
    ) -> Result<()> {
        let clock = Clock::get()?;
        let player = &mut ctx.accounts.player_state;
        player.owner = ctx.accounts.player.key();
        player.total_phases_completed = 0;
        player.total_tokens_earned = 0;
        player.daily_completions = 0;
        player.last_daily_reset = clock.unix_timestamp;
        player.reserved = [0; 64];
        player.bump = bump;
        Ok(())
    }

    // ------------------------------------------------
    // Complete a phase — mint reward tokens
    // ------------------------------------------------
    pub fn complete_phase(
        ctx: Context<CompletePhase>,
        phase_id: u8,
        stars: u8,
        time_seconds: u32,
        kills: u32,
        soldiers_alive: u8,
        server_signature: [u8; 64],
    ) -> Result<()> {
        let clock = Clock::get()?;

        // Validate phase range
        require!(phase_id >= 1 && phase_id <= TOTAL_PHASES, SquadError::InvalidPhase);
        require!(stars >= 1 && stars <= 3, SquadError::InvalidStars);

        // Validate the server's signature (off-chain validation proof)
        let msg = format!("SQUAD_FALL:{}:{}:{}:{}:{}:{}",
            ctx.accounts.player.key(), phase_id, stars,
            time_seconds, kills, soldiers_alive
        );
        // In production: verify ed25519 signature against a known authority public key
        // require!(verify_signature(&server_signature, &msg, &game_state.authority), SquadError::InvalidProof);

        // --- Anti-farming: Daily limit ---
        let player = &mut ctx.accounts.player_state;
        let today_start = (clock.unix_timestamp / 86400) * 86400;
        if clock.unix_timestamp - player.last_daily_reset >= 86400 {
            player.daily_completions = 0;
            player.last_daily_reset = today_start;
        }
        require!(player.daily_completions < DAILY_LIMIT, SquadError::DailyLimitExceeded);

        // --- Check phase completion / cooldown ---
        let phase = &mut ctx.accounts.phase_completion;

        if phase.completed_at == 0 {
            // First time completing this phase
            phase.player = ctx.accounts.player.key();
            phase.phase_id = phase_id;
            phase.stars = stars;
            phase.completed_at = clock.unix_timestamp;
            phase.replay_count = 0;
            phase.last_replay_at = 0;
            player.total_phases_completed += 1;
        } else {
            // Replay — check cooldown
            require!(
                clock.unix_timestamp - phase.last_replay_at >= PHASE_COOLDOWN,
                SquadError::CooldownActive
            );
            phase.replay_count += 1;
            phase.last_replay_at = clock.unix_timestamp;

            // Update stars if better
            if stars > phase.stars {
                phase.stars = stars;
            }
        }

        // --- Calculate reward ---
        let base_reward = get_phase_reward(phase_id);

        // First time: full reward × star multiplier
        // Replay: 10% of base × star multiplier
        let is_replay = phase.replay_count > 0;
        let reward = if is_replay {
            base_reward.checked_div(10).unwrap_or(0)
                .checked_mul(stars as u64).unwrap_or(0)
        } else {
            base_reward.checked_mul(stars as u64).unwrap_or(0)
        };

        // --- World 3+ requires staking ---
        let world = get_world(phase_id);
        let required_stake = match world {
            1 | 2 => 0,
            3 => STAKE_WORLD_3,
            4 => STAKE_WORLD_4,
            5 => STAKE_WORLD_5,
            _ => return Err(SquadError::InvalidWorld.into()),
        };

        if required_stake > 0 && !is_replay {
            let stake = &ctx.accounts.stake_account;
            require!(stake.amount >= required_stake, SquadError::InsufficientStake);
        }

        // --- Mint reward ---
        if reward > 0 {
            // Build the CPI context with correct seeds
            let seeds: &[&[u8]] = &[
                b"game-state",
                &ctx.accounts.game_state.key().to_bytes(),
                &[ctx.accounts.game_state.bump],
            ];
            let signer_seeds: &[&[&[u8]]] = &[seeds];

            let cpi_accounts = MintTo {
                mint: ctx.accounts.squad_mint.to_account_info(),
                to: ctx.accounts.player_token_account.to_account_info(),
                authority: ctx.accounts.game_state.to_account_info(),
            };
            let cpi_ctx = CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                cpi_accounts,
                signer_seeds,
            );
            token::mint_to(cpi_ctx, reward)?;

            // Update state
            let game_state = &mut ctx.accounts.game_state;
            game_state.total_rewards_claimed = game_state.total_rewards_claimed
                .checked_add(reward)
                .unwrap();
        }

        // --- Update player stats ---
        player.total_tokens_earned = player.total_tokens_earned
            .checked_add(reward)
            .unwrap();
        player.daily_completions += 1;

        emit!(PhaseCompletedEvent {
            player: ctx.accounts.player.key(),
            phase_id,
            stars,
            reward,
            is_replay,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    // ------------------------------------------------
    // Stake SQUAD tokens
    // ------------------------------------------------
    pub fn stake_tokens(
        ctx: Context<StakeTokens>,
        amount: u64,
        bump: u8,
    ) -> Result<()> {
        let clock = Clock::get()?;

        // Transfer tokens from player to stake vault
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.player_token_account.to_account_info(),
                to: ctx.accounts.stake_vault.to_account_info(),
                authority: ctx.accounts.player.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, amount)?;

        // Initialize or add to stake account
        let stake = &mut ctx.accounts.stake_account;
        if stake.owner == Pubkey::default() {
            stake.owner = ctx.accounts.player.key();
            stake.amount = amount;
            stake.staked_at = clock.unix_timestamp;
            stake.unlock_requested_at = None;
            stake.bump = bump;
        } else {
            stake.amount = stake.amount.checked_add(amount).unwrap();
        }

        emit!(StakeEvent {
            player: ctx.accounts.player.key(),
            amount,
            total_staked: stake.amount,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    // ------------------------------------------------
    // Request unstake (starts 7-day cooldown)
    // ------------------------------------------------
    pub fn request_unstake(ctx: Context<RequestUnstake>) -> Result<()> {
        let clock = Clock::get()?;
        let stake = &mut ctx.accounts.stake_account;
        require!(stake.amount > 0, SquadError::NoStake);
        require!(stake.unlock_requested_at.is_none(), SquadError::UnstakeAlreadyRequested);

        stake.unlock_requested_at = Some(clock.unix_timestamp);

        emit!(UnstakeRequestedEvent {
            player: ctx.accounts.player.key(),
            amount: stake.amount,
            requested_at: clock.unix_timestamp,
        });

        Ok(())
    }

    // ------------------------------------------------
    // Withdraw after unlock period
    // ------------------------------------------------
    pub fn withdraw_unstaked(ctx: Context<WithdrawUnstaked>) -> Result<()> {
        let clock = Clock::get()?;
        let stake = &mut ctx.accounts.stake_account;

        let requested_at = stake.unlock_requested_at
            .ok_or(SquadError::UnstakeNotRequested)?;
        require!(
            clock.unix_timestamp - requested_at >= STAKE_UNLOCK_PERIOD,
            SquadError::UnlockPeriodNotMet
        );

        let amount = stake.amount;
        stake.amount = 0;
        stake.unlock_requested_at = None;

        // Transfer back
        let game_state = &ctx.accounts.game_state;
        let seeds: &[&[u8]] = &[
            b"stake-vault",
            &ctx.accounts.stake_account.key().to_bytes(),
            &[stake.bump],
        ];
        let signer_seeds: &[&[&[u8]]] = &[seeds];

        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.stake_vault.to_account_info(),
                to: ctx.accounts.player_token_account.to_account_info(),
                authority: ctx.accounts.stake_account.to_account_info(),
            },
            signer_seeds,
        );
        token::transfer(transfer_ctx, amount)?;

        emit!(UnstakeWithdrawnEvent {
            player: ctx.accounts.player.key(),
            amount,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    // ------------------------------------------------
    // Admin: set authority (transfer ownership)
    // ------------------------------------------------
    pub fn set_authority(
        ctx: Context<SetAuthority>,
        new_authority: Pubkey,
    ) -> Result<()> {
        ctx.accounts.game_state.authority = new_authority;
        Ok(())
    }
}

// ============================================================
// CONTEXT STRUCTS
// ============================================================

#[derive(Accounts)]
#[instruction(game_state_bump: u8)]
pub struct InitializeGame<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 32 + 8 + 1,
        seeds = [b"game-state"],
        bump = game_state_bump,
    )]
    pub game_state: Account<'info, GameState>,

    /// CHECK: SQUAD token mint (created separately via SPL CLI or another program)
    pub squad_mint: Account<'info, Mint>,

    /// CHECK: Token account for reward vault
    pub reward_vault: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct InitializePlayer<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(
        init,
        payer = player,
        space = 8 + 32 + 4 + 8 + 1 + 8 + 64 + 1,
        seeds = [b"player", player.key().as_ref()],
        bump = bump,
    )]
    pub player_state: Account<'info, PlayerState>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CompletePhase<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(mut, seeds = [b"game-state"], bump = game_state.bump)]
    pub game_state: Account<'info, GameState>,

    #[account(
        mut,
        seeds = [b"player", player.key().as_ref()],
        bump = player_state.bump,
    )]
    pub player_state: Account<'info, PlayerState>,

    #[account(
        init_if_needed,
        payer = player,
        space = 8 + 32 + 1 + 1 + 8 + 1 + 8 + 1,
        seeds = [b"phase", player.key().as_ref(), &[phase_id]],
        bump,
    )]
    pub phase_completion: Account<'info, PhaseCompletion>,

    /// CHECK: Player's ATA for SQUAD
    #[account(mut)]
    pub player_token_account: AccountInfo<'info>,

    /// CHECK: SQUAD mint
    pub squad_mint: AccountInfo<'info>,

    #[account(
        seeds = [b"stake", player.key().as_ref()],
        bump = stake_account.bump,
    )]
    pub stake_account: Account<'info, StakeAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(amount: u64, bump: u8)]
pub struct StakeTokens<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(mut)]
    pub player_token_account: Account<'info, TokenAccount>,

    /// CHECK: Stake vault holding staked SQUAD
    #[account(mut)]
    pub stake_vault: AccountInfo<'info>,

    #[account(
        init_if_needed,
        payer = player,
        space = 8 + 32 + 8 + 8 + 9 + 1,
        seeds = [b"stake", player.key().as_ref()],
        bump = bump,
    )]
    pub stake_account: Account<'info, StakeAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RequestUnstake<'info> {
    pub player: Signer<'info>,

    #[account(
        mut,
        seeds = [b"stake", player.key().as_ref()],
        bump = stake_account.bump,
    )]
    pub stake_account: Account<'info, StakeAccount>,
}

#[derive(Accounts)]
pub struct WithdrawUnstaked<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(seeds = [b"game-state"], bump = game_state.bump)]
    pub game_state: Account<'info, GameState>,

    #[account(
        mut,
        seeds = [b"stake", player.key().as_ref()],
        bump = stake_account.bump,
    )]
    pub stake_account: Account<'info, StakeAccount>,

    /// CHECK: Stake vault
    #[account(mut)]
    pub stake_vault: AccountInfo<'info>,

    #[account(mut)]
    pub player_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct SetAuthority<'info> {
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"game-state"],
        bump = game_state.bump,
        constraint = game_state.authority == authority.key(),
    )]
    pub game_state: Account<'info, GameState>,
}

// ============================================================
// EVENTS
// ============================================================

#[event]
pub struct PhaseCompletedEvent {
    pub player: Pubkey,
    pub phase_id: u8,
    pub stars: u8,
    pub reward: u64,
    pub is_replay: bool,
    pub timestamp: i64,
}

#[event]
pub struct StakeEvent {
    pub player: Pubkey,
    pub amount: u64,
    pub total_staked: u64,
    pub timestamp: i64,
}

#[event]
pub struct UnstakeRequestedEvent {
    pub player: Pubkey,
    pub amount: u64,
    pub requested_at: i64,
}

#[event]
pub struct UnstakeWithdrawnEvent {
    pub player: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

// ============================================================
// ERRORS
// ============================================================

#[error_code]
pub enum SquadError {
    #[msg("Phase ID must be between 1 and 30")]
    InvalidPhase,
    #[msg("Stars must be 1, 2, or 3")]
    InvalidStars,
    #[msg("Daily completion limit reached — come back tomorrow")]
    DailyLimitExceeded,
    #[msg("Phase still on cooldown — wait before replaying")]
    CooldownActive,
    #[msg("Invalid server proof — possible cheating detected")]
    InvalidProof,
    #[msg("Invalid world number")]
    InvalidWorld,
    #[msg("Insufficient staked SQUAD to access this world")]
    InsufficientStake,
    #[msg("No stake to unstake")]
    NoStake,
    #[msg("Unstake already requested — wait for unlock period")]
    UnstakeAlreadyRequested,
    #[msg("Unstake has not been requested yet")]
    UnstakeNotRequested,
    #[msg("Unlock period not yet met — 7 days required")]
    UnlockPeriodNotMet,
    #[msg("Arithmetic overflow")]
    Overflow,
}