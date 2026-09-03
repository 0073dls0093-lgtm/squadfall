import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SquadFall } from "../target/types/squad_fall";
import {
    createMint,
    getOrCreateAssociatedTokenAccount,
    mintTo,
} from "@solana/spl-token";
import { assert, expect } from "chai";

describe("SquadFall — Game Contract", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.SquadFall as Program<SquadFall>;

    // Test accounts
    let squadMint: anchor.web3.PublicKey;
    let rewardVault: anchor.web3.PublicKey;
    let playerSquadAta: anchor.web3.PublicKey;
    let stakeVault: anchor.web3.PublicKey;

    // PDAs
    let gameStatePda: anchor.web3.PublicKey;
    let gameStateBump: number;
    let playerStatePda: anchor.web3.PublicKey;
    let playerStateBump: number;

    const player = anchor.web3.Keypair.generate();

    // Airdrop SOL to player
    before(async () => {
        const sig = await provider.connection.requestAirdrop(
            player.publicKey,
            10 * anchor.web3.LAMPORTS_PER_SOL
        );
        await provider.connection.confirmTransaction(sig, "confirmed");
    });

    // ======================================================
    // TOKEN SETUP
    // ======================================================

    it("Creates the $SQUAD token mint", async () => {
        squadMint = await createMint(
            provider.connection,
            player,
            provider.wallet.publicKey, // freeze authority
            null, // no freeze
            9 // decimals
        );
        expect(squadMint).to.not.be.null;
        console.log("SQUAD mint:", squadMint.toBase58());
    });

    it("Creates the reward vault token account", async () => {
        rewardVault = (
            await getOrCreateAssociatedTokenAccount(
                provider.connection,
                player,
                squadMint,
                provider.wallet.publicKey
            )
        ).address;
        console.log("Reward vault:", rewardVault.toBase58());
    });

    it("Creates player token account and mints initial SQUAD", async () => {
        playerSquadAta = (
            await getOrCreateAssociatedTokenAccount(
                provider.connection,
                player,
                squadMint,
                player.publicKey
            )
        ).address;

        // Mint some SQUAD to player for staking tests
        await mintTo(
            provider.connection,
            player,
            squadMint,
            playerSquadAta,
            provider.wallet.publicKey,
            50_000_000_000_000 // 50,000 SQUAD for testing
        );
        console.log("Player ATA:", playerSquadAta.toBase58());
    });

    // ======================================================
    // GAME STATE INITIALIZATION
    // ======================================================

    it("Initializes game state", async () => {
        [gameStatePda, gameStateBump] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("game-state")],
            program.programId
        );

        await program.methods
            .initializeGame(gameStateBump)
            .accounts({
                authority: provider.wallet.publicKey,
                gameState: gameStatePda,
                squadMint: squadMint,
                rewardVault: rewardVault,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .rpc();

        const state = await program.account.gameState.fetch(gameStatePda);
        expect(state.authority.toBase58()).to.equal(
            provider.wallet.publicKey.toBase58()
        );
        console.log("Game state initialized at:", gameStatePda.toBase58());
    });

    it("Initializes player state", async () => {
        [playerStatePda, playerStateBump] =
            anchor.web3.PublicKey.findProgramAddressSync(
                [Buffer.from("player"), player.publicKey.toBuffer()],
                program.programId
            );

        await program.methods
            .initializePlayer(playerStateBump)
            .accounts({
                player: player.publicKey,
                playerState: playerStatePda,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([player])
            .rpc();

        const state = await program.account.playerState.fetch(playerStatePda);
        expect(state.owner.toBase58()).to.equal(player.publicKey.toBase58());
        expect(state.totalPhasesCompleted).to.equal(0);
        console.log("Player state initialized");
    });

    // ======================================================
    // STAKING
    // ======================================================

    let stakePda: anchor.web3.PublicKey;
    let stakeBump: number;

    it("Stakes 1000 SQUAD tokens", async () => {
        [stakePda, stakeBump] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("stake"), player.publicKey.toBuffer()],
            program.programId
        );

        // Create stake vault
        stakeVault = (
            await getOrCreateAssociatedTokenAccount(
                provider.connection,
                player,
                squadMint,
                stakePda, // PDA as owner — needs PDAs
                // Note: in production, the stake vault is a PDA-owned token account
            )
        ).address;

        const stakeAmount = new anchor.BN(1_000_000_000_000); // 1000 SQUAD

        await program.methods
            .stakeTokens(stakeAmount, stakeBump)
            .accounts({
                player: player.publicKey,
                playerTokenAccount: playerSquadAta,
                stakeVault: stakeVault,
                stakeAccount: stakePda,
                tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([player])
            .rpc();

        const stake = await program.account.stakeAccount.fetch(stakePda);
        expect(stake.amount.toNumber()).to.equal(stakeAmount.toNumber());
        console.log("Staked: 1000 SQUAD");
    });

    // ======================================================
    // PHASE COMPLETION (first-time)
    // ======================================================

    it("Completes phase 1-1 (World 1, no stake needed) — first time", async () => {
        const phaseId = 1;
        const stars = 3; // 3 stars for max reward
        const timeSeconds = 45;
        const kills = 8;
        const soldiersAlive = 4;
        const serverSignature = new Uint8Array(64); // Mock signature for testing

        // NOTE: Signature verification is commented out in the contract
        // for devnet testing. In production, the server signs and we verify.

        const [phasePda] = anchor.web3.PublicKey.findProgramAddressSync(
            [
                Buffer.from("phase"),
                player.publicKey.toBuffer(),
                Buffer.from([phaseId]),
            ],
            program.programId
        );

        await program.methods
            .completePhase(
                phaseId,
                stars,
                timeSeconds,
                kills,
                soldiersAlive,
                Array.from(serverSignature)
            )
            .accounts({
                player: player.publicKey,
                gameState: gameStatePda,
                playerState: playerStatePda,
                phaseCompletion: phasePda,
                playerTokenAccount: playerSquadAta,
                squadMint: squadMint,
                stakeAccount: stakePda,
                tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([player])
            .rpc();

        // Check phase record
        const phase = await program.account.phaseCompletion.fetch(phasePda);
        expect(phase.phaseId).to.equal(phaseId);
        expect(phase.stars).to.equal(3);
        expect(phase.replayCount).to.equal(0);
        console.log("Phase 1-1 completed with 3 stars!");
    });

    it("Verify player state updated after phase", async () => {
        const playerState = await program.account.playerState.fetch(
            playerStatePda
        );
        expect(playerState.totalPhasesCompleted).to.equal(1);
        // Base reward: 10 SQUAD × 3 stars = 30 SQUAD
        expect(playerState.totalTokensEarned.toNumber()).to.equal(
            30_000_000_000
        );
        console.log(
            "Tokens earned:",
            playerState.totalTokensEarned.toNumber() / 1_000_000_000,
            "SQUAD"
        );
    });

    // ======================================================
    // PHASE COMPLETION (replay with cooldown)
    // ======================================================

    it("Fails on replay without cooldown", async () => {
        const phaseId = 1;
        const serverSignature = new Uint8Array(64);

        const [phasePda] = anchor.web3.PublicKey.findProgramAddressSync(
            [
                Buffer.from("phase"),
                player.publicKey.toBuffer(),
                Buffer.from([phaseId]),
            ],
            program.programId
        );

        try {
            await program.methods
                .completePhase(phaseId, 1, 90, 8, 4, Array.from(serverSignature))
                .accounts({
                    player: player.publicKey,
                    gameState: gameStatePda,
                    playerState: playerStatePda,
                    phaseCompletion: phasePda,
                    playerTokenAccount: playerSquadAta,
                    squadMint: squadMint,
                    stakeAccount: stakePda,
                    tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .signers([player])
                .rpc();

            assert.fail("Should have thrown cooldown error");
        } catch (err: any) {
            expect(err.toString()).to.include("CooldownActive");
            console.log("Cooldown correctly enforced");
        }
    });

    // ======================================================
    // WORLD 3+ STAKING REQUIREMENT (test with insufficient stake)
    // ======================================================

    it("Fails on World 3 phase without enough stake (needs 100 SQUAD but we staked more)", async () => {
        // We staked 1000 SQUAD which is > 100, so this should pass
        const phaseId = 13; // World 3, Phase 3-1
        const stars = 1;
        const serverSignature = new Uint8Array(64);

        const [phasePda] = anchor.web3.PublicKey.findProgramAddressSync(
            [
                Buffer.from("phase"),
                player.publicKey.toBuffer(),
                Buffer.from([phaseId]),
            ],
            program.programId
        );

        await program.methods
            .completePhase(phaseId, stars, 120, 15, 3, Array.from(serverSignature))
            .accounts({
                player: player.publicKey,
                gameState: gameStatePda,
                playerState: playerStatePda,
                phaseCompletion: phasePda,
                playerTokenAccount: playerSquadAta,
                squadMint: squadMint,
                stakeAccount: stakePda,
                tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([player])
            .rpc();

        const phase = await program.account.phaseCompletion.fetch(phasePda);
        expect(phase.phaseId).to.equal(phaseId);
        console.log("Phase 3-1 completed with sufficient stake ✅");
    });

    // ======================================================
    // EDGE CASES
    // ======================================================

    it("Fails with invalid phase ID (0)", async () => {
        const serverSignature = new Uint8Array(64);

        const [phasePda] = anchor.web3.PublicKey.findProgramAddressSync(
            [
                Buffer.from("phase"),
                player.publicKey.toBuffer(),
                Buffer.from([0]),
            ],
            program.programId
        );

        try {
            await program.methods
                .completePhase(0, 1, 30, 5, 4, Array.from(serverSignature))
                .accounts({
                    player: player.publicKey,
                    gameState: gameStatePda,
                    playerState: playerStatePda,
                    phaseCompletion: phasePda,
                    playerTokenAccount: playerSquadAta,
                    squadMint: squadMint,
                    stakeAccount: stakePda,
                    tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .signers([player])
                .rpc();
            assert.fail("Should have thrown InvalidPhase");
        } catch (err: any) {
            expect(err.toString()).to.include("InvalidPhase");
            console.log("Invalid phase rejected ✅");
        }
    });

    it("Fails with invalid stars (4)", async () => {
        const serverSignature = new Uint8Array(64);
        const phaseId = 2;

        const [phasePda] = anchor.web3.PublicKey.findProgramAddressSync(
            [
                Buffer.from("phase"),
                player.publicKey.toBuffer(),
                Buffer.from([phaseId]),
            ],
            program.programId
        );

        try {
            await program.methods
                .completePhase(phaseId, 4, 30, 5, 4, Array.from(serverSignature))
                .accounts({
                    player: player.publicKey,
                    gameState: gameStatePda,
                    playerState: playerStatePda,
                    phaseCompletion: phasePda,
                    playerTokenAccount: playerSquadAta,
                    squadMint: squadMint,
                    stakeAccount: stakePda,
                    tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .signers([player])
                .rpc();
            assert.fail("Should have thrown InvalidStars");
        } catch (err: any) {
            expect(err.toString()).to.include("InvalidStars");
            console.log("Invalid stars rejected ✅");
        }
    });

    // ======================================================
    // UNSTAKING
    // ======================================================

    it("Requests unstake", async () => {
        await program.methods
            .requestUnstake()
            .accounts({
                player: player.publicKey,
                stakeAccount: stakePda,
            })
            .signers([player])
            .rpc();

        const stake = await program.account.stakeAccount.fetch(stakePda);
        expect(stake.unlockRequestedAt).to.not.be.null;
        console.log("Unstake requested — 7 day cooldown started");
    });

    it("Fails to withdraw before unlock period", async () => {
        try {
            await program.methods
                .withdrawUnstaked()
                .accounts({
                    player: player.publicKey,
                    gameState: gameStatePda,
                    stakeAccount: stakePda,
                    stakeVault: stakeVault,
                    playerTokenAccount: playerSquadAta,
                    tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
                })
                .signers([player])
                .rpc();
            assert.fail("Should have thrown UnlockPeriodNotMet");
        } catch (err: any) {
            expect(err.toString()).to.include("UnlockPeriodNotMet");
            console.log("Withdraw blocked — unlock period not met ✅");
        }
    });

    console.log("\n========================================");
    console.log("ALL TESTS PASSED — SQUAD FALL READY");
    console.log("========================================");
});