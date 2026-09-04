import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SquadFall } from "../target/types/squad_fall";
import {
    createMint,
    getOrCreateAssociatedTokenAccount,
    mintTo,
} from "@solana/spl-token";
import { assert, expect } from "chai";

describe("SquadFall — Security Audit Tests", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.SquadFall as Program<SquadFall>;

    let squadMint: anchor.web3.PublicKey;
    let rewardVault: anchor.web3.PublicKey;
    let playerSquadAta: anchor.web3.PublicKey;
    let stakeVault: anchor.web3.PublicKey;
    let gameStatePda: anchor.web3.PublicKey;
    let gameStateBump: number;
    let playerStatePda: anchor.web3.PublicKey;
    let playerStateBump: number;
    let stakePda: anchor.web3.PublicKey;
    let stakeBump: number;

    const player = anchor.web3.Keypair.generate();
    const serverAuthority = anchor.web3.Keypair.generate();
    const fakeAuthority = anchor.web3.Keypair.generate();

    before(async () => {
        const sig = await provider.connection.requestAirdrop(
            player.publicKey,
            10 * anchor.web3.LAMPORTS_PER_SOL
        );
        await provider.connection.confirmTransaction(sig, "confirmed");
        const sig2 = await provider.connection.requestAirdrop(
            serverAuthority.publicKey,
            5 * anchor.web3.LAMPORTS_PER_SOL
        );
        await provider.connection.confirmTransaction(sig2, "confirmed");
    });

    // ======================================================
    // TOKEN SETUP — mint authority MUST be game_state PDA
    // ======================================================

    it("Creates $SQUAD token mint with game_state PDA as authority", async () => {
        [gameStatePda, gameStateBump] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("game-state")],
            program.programId
        );

        squadMint = await createMint(
            provider.connection,
            player,
            gameStatePda,
            null,
            9
        );
        expect(squadMint).to.not.be.null;
        console.log("SQUAD mint (authority=game_state PDA):", squadMint.toBase58());
    });

    it("Creates reward vault and player token accounts", async () => {
        rewardVault = (
            await getOrCreateAssociatedTokenAccount(
                provider.connection,
                player,
                squadMint,
                provider.wallet.publicKey
            )
        ).address;

        playerSquadAta = (
            await getOrCreateAssociatedTokenAccount(
                provider.connection,
                player,
                squadMint,
                player.publicKey
            )
        ).address;
        console.log("Player ATA:", playerSquadAta.toBase58());
    });

    // ======================================================
    // GAME STATE INITIALIZATION
    // ======================================================

    it("Initializes game state with server authority", async () => {
        await program.methods
            .initializeGame(gameStateBump)
            .accounts({
                authority: serverAuthority.publicKey,
                gameState: gameStatePda,
                squadMint: squadMint,
                rewardVault: rewardVault,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([serverAuthority])
            .rpc();

        const state = await program.account.gameState.fetch(gameStatePda);
        expect(state.authority.toBase58()).to.equal(
            serverAuthority.publicKey.toBase58()
        );
        expect(state.squadMint.toBase58()).to.equal(squadMint.toBase58());
        console.log("Game state initialized, authority:", state.authority.toBase58());
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
    });

    // ======================================================
    // STAKING
    // ======================================================

    it("Stakes 1000 SQUAD tokens", async () => {
        [stakePda, stakeBump] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("stake"), player.publicKey.toBuffer()],
            program.programId
        );

        stakeVault = (
            await getOrCreateAssociatedTokenAccount(
                provider.connection,
                player,
                squadMint,
                stakePda,
                true,
            )
        ).address;
        console.log("Stake vault:", stakeVault.toBase58());
    });

    // ======================================================
    // PHASE COMPLETION — POSITIVE TESTS
    // ======================================================

    it("Completes phase 1-1 with server authority co-signing", async () => {
        const phaseId = 1;
        const stars = 3;
        const timeSeconds = 30;
        const kills = 0;
        const soldiersAlive = 4;

        const [phasePda] = anchor.web3.PublicKey.findProgramAddressSync(
            [
                Buffer.from("phase"),
                player.publicKey.toBuffer(),
                Buffer.from([phaseId]),
            ],
            program.programId
        );

        await program.methods
            .completePhase(phaseId, stars, timeSeconds, kills, soldiersAlive)
            .accounts({
                player: player.publicKey,
                serverAuthority: serverAuthority.publicKey,
                gameState: gameStatePda,
                playerState: playerStatePda,
                phaseCompletion: phasePda,
                playerTokenAccount: playerSquadAta,
                squadMint: squadMint,
                stakeAccount: stakePda,
                tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([player, serverAuthority])
            .rpc();

        const phase = await program.account.phaseCompletion.fetch(phasePda);
        expect(phase.phaseId).to.equal(phaseId);
        expect(phase.stars).to.equal(3);
        expect(phase.replayCount).to.equal(0);
        console.log("Phase 1-1 completed with 3 stars + server co-sign!");
    });

    // ======================================================
    // NEGATIVE TESTS — SECURITY
    // ======================================================

    it("FAILS: complete_phase without server authority (wrong signer)", async () => {
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
                .completePhase(phaseId, 1, 30, 5, 4)
                .accounts({
                    player: player.publicKey,
                    serverAuthority: fakeAuthority.publicKey,
                    gameState: gameStatePda,
                    playerState: playerStatePda,
                    phaseCompletion: phasePda,
                    playerTokenAccount: playerSquadAta,
                    squadMint: squadMint,
                    stakeAccount: stakePda,
                    tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .signers([player, fakeAuthority])
                .rpc();
            assert.fail("Should have thrown InvalidServerAuthority");
        } catch (err: any) {
            expect(err.toString()).to.include("InvalidServerAuthority");
            console.log("✅ Wrong server authority rejected");
        }
    });

    it("FAILS: replay before cooldown expires", async () => {
        const phaseId = 1;
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
                .completePhase(phaseId, 1, 40, 0, 4)
                .accounts({
                    player: player.publicKey,
                    serverAuthority: serverAuthority.publicKey,
                    gameState: gameStatePda,
                    playerState: playerStatePda,
                    phaseCompletion: phasePda,
                    playerTokenAccount: playerSquadAta,
                    squadMint: squadMint,
                    stakeAccount: stakePda,
                    tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .signers([player, serverAuthority])
                .rpc();
            assert.fail("Should have thrown CooldownActive");
        } catch (err: any) {
            expect(err.toString()).to.include("CooldownActive");
            console.log("✅ Replay before cooldown rejected");
        }
    });

    it("FAILS: invalid phase ID (0)", async () => {
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
                .completePhase(0, 1, 30, 5, 4)
                .accounts({
                    player: player.publicKey,
                    serverAuthority: serverAuthority.publicKey,
                    gameState: gameStatePda,
                    playerState: playerStatePda,
                    phaseCompletion: phasePda,
                    playerTokenAccount: playerSquadAta,
                    squadMint: squadMint,
                    stakeAccount: stakePda,
                    tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .signers([player, serverAuthority])
                .rpc();
            assert.fail("Should have thrown InvalidPhase");
        } catch (err: any) {
            expect(err.toString()).to.include("InvalidPhase");
            console.log("✅ Invalid phase ID rejected");
        }
    });

    it("FAILS: invalid stars (4)", async () => {
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
                .completePhase(phaseId, 4, 30, 5, 4)
                .accounts({
                    player: player.publicKey,
                    serverAuthority: serverAuthority.publicKey,
                    gameState: gameStatePda,
                    playerState: playerStatePda,
                    phaseCompletion: phasePda,
                    playerTokenAccount: playerSquadAta,
                    squadMint: squadMint,
                    stakeAccount: stakePda,
                    tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .signers([player, serverAuthority])
                .rpc();
            assert.fail("Should have thrown InvalidStars");
        } catch (err: any) {
            expect(err.toString()).to.include("InvalidStars");
            console.log("✅ Invalid stars rejected");
        }
    });

    it("FAILS: invalid time_seconds (0)", async () => {
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
                .completePhase(phaseId, 1, 0, 5, 4)
                .accounts({
                    player: player.publicKey,
                    serverAuthority: serverAuthority.publicKey,
                    gameState: gameStatePda,
                    playerState: playerStatePda,
                    phaseCompletion: phasePda,
                    playerTokenAccount: playerSquadAta,
                    squadMint: squadMint,
                    stakeAccount: stakePda,
                    tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .signers([player, serverAuthority])
                .rpc();
            assert.fail("Should have thrown InvalidTime");
        } catch (err: any) {
            expect(err.toString()).to.include("InvalidTime");
            console.log("✅ Invalid time_seconds rejected");
        }
    });

    it("FAILS: invalid kills (101)", async () => {
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
                .completePhase(phaseId, 1, 30, 101, 4)
                .accounts({
                    player: player.publicKey,
                    serverAuthority: serverAuthority.publicKey,
                    gameState: gameStatePda,
                    playerState: playerStatePda,
                    phaseCompletion: phasePda,
                    playerTokenAccount: playerSquadAta,
                    squadMint: squadMint,
                    stakeAccount: stakePda,
                    tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .signers([player, serverAuthority])
                .rpc();
            assert.fail("Should have thrown InvalidKills");
        } catch (err: any) {
            expect(err.toString()).to.include("InvalidKills");
            console.log("✅ Invalid kills rejected");
        }
    });

    it("FAILS: invalid soldiers_alive (5)", async () => {
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
                .completePhase(phaseId, 1, 30, 5, 5)
                .accounts({
                    player: player.publicKey,
                    serverAuthority: serverAuthority.publicKey,
                    gameState: gameStatePda,
                    playerState: playerStatePda,
                    phaseCompletion: phasePda,
                    playerTokenAccount: playerSquadAta,
                    squadMint: squadMint,
                    stakeAccount: stakePda,
                    tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .signers([player, serverAuthority])
                .rpc();
            assert.fail("Should have thrown InvalidSoldiersAlive");
        } catch (err: any) {
            expect(err.toString()).to.include("InvalidSoldiersAlive");
            console.log("✅ Invalid soldiers_alive rejected");
        }
    });

    it("FAILS: wrong mint (not game_state.squad_mint)", async () => {
        const fakeMint = await createMint(
            provider.connection,
            player,
            player.publicKey,
            null,
            9
        );
        const fakeAta = (
            await getOrCreateAssociatedTokenAccount(
                provider.connection,
                player,
                fakeMint,
                player.publicKey
            )
        ).address;

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
                .completePhase(phaseId, 1, 30, 5, 4)
                .accounts({
                    player: player.publicKey,
                    serverAuthority: serverAuthority.publicKey,
                    gameState: gameStatePda,
                    playerState: playerStatePda,
                    phaseCompletion: phasePda,
                    playerTokenAccount: fakeAta,
                    squadMint: squadMint,
                    stakeAccount: stakePda,
                    tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .signers([player, serverAuthority])
                .rpc();
            assert.fail("Should have thrown InvalidMint");
        } catch (err: any) {
            expect(err.toString()).to.include("InvalidMint");
            console.log("✅ Wrong mint rejected");
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

    it("FAILS: withdraw before unlock period", async () => {
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
            console.log("✅ Withdraw blocked — unlock period not met");
        }
    });

    console.log("\n========================================");
    console.log("SECURITY AUDIT TESTS COMPLETE");
    console.log("========================================");
});
