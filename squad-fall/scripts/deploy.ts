#!/usr/bin/env node
// deploy-squad-fall.ts — Deploy script for Solana Devnet
require("dotenv").config();
const anchor = require("@coral-xyz/anchor");
const { Connection, Keypair, PublicKey, SystemProgram } = require("@solana/web3.js");
const { createMint, getOrCreateAssociatedTokenAccount, mintTo } = require("@solana/spl-token");
const fs = require("fs");
const path = require("path");

const DEVNET_URL = "https://api.devnet.solana.com";
const PROGRAM_KEYPAIR_PATH = path.join(__dirname, "..", "target", "deploy", "squad_fall-keypair.json");
const IDL_PATH = path.join(__dirname, "..", "target", "idl", "squad_fall.json");

async function main() {
    console.log("========================================");
    console.log("  SQUAD FALL — DEPLOY TO DEVNET");
    console.log("========================================\n");

    const connection = new Connection(DEVNET_URL, "confirmed");
    const wallet = anchor.Wallet.local();

    console.log(`Network: Devnet`);
    console.log(`Wallet:  ${wallet.publicKey.toBase58()}`);
    const balance = await connection.getBalance(wallet.publicKey);
    console.log(`Balance: ${balance / anchor.web3.LAMPORTS_PER_SOL} SOL\n`);

    if (balance < 2 * anchor.web3.LAMPORTS_PER_SOL) {
        console.log("Requesting airdrop...");
        const sig = await connection.requestAirdrop(wallet.publicKey, 5 * anchor.web3.LAMPORTS_PER_SOL);
        await connection.confirmTransaction(sig, "confirmed");
        console.log("Airdrop received ✅\n");
    }

    console.log("Step 1/5: Building Anchor program...");
    const { execSync } = require("child_process");
    try {
        execSync("anchor build", { cwd: path.join(__dirname, ".."), stdio: "inherit" });
        console.log("Build successful ✅\n");
    } catch (e) {
        console.error("Build failed. Run `anchor build` manually to debug.");
        process.exit(1);
    }

    console.log("Step 2/5: Deploying program to Devnet...");
    try {
        execSync("anchor deploy --provider.cluster devnet", {
            cwd: path.join(__dirname, ".."),
            stdio: "inherit",
        });
        console.log("Deploy successful ✅\n");
    } catch (e) {
        console.error("Deploy failed. Check your SOL balance and network.");
        process.exit(1);
    }

    const programKeypair = JSON.parse(fs.readFileSync(PROGRAM_KEYPAIR_PATH, "utf-8"));
    const programId = Keypair.fromSecretKey(Uint8Array.from(programKeypair)).publicKey;
    console.log(`Program ID: ${programId.toBase58()}\n`);

    console.log("Step 3/5: Creating $SQUAD token...");
    const squadMint = await createMint(
        connection, wallet.payer, wallet.publicKey, null, 9
    );
    console.log(`SQUAD Mint:  ${squadMint.toBase58()}\n`);

    console.log("Step 4/5: Creating reward vault...");
    const rewardVault = (await getOrCreateAssociatedTokenAccount(
        connection, wallet.payer, squadMint, wallet.publicKey
    )).address;
    console.log(`Reward Vault: ${rewardVault.toBase58()}\n`);

    console.log("Step 5/5: Initializing game state...");
    const [gameStatePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("game-state")], programId
    );

    const idl = JSON.parse(fs.readFileSync(IDL_PATH, "utf-8"));
    const provider = new anchor.AnchorProvider(connection, wallet, {});
    anchor.setProvider(provider);
    const program = new anchor.Program(idl, programId, provider);

    await program.methods
        .initializeGame(gameStateBump())
        .accounts({
            authority: wallet.publicKey,
            gameState: gameStatePda,
            squadMint: squadMint,
            rewardVault: rewardVault,
            systemProgram: SystemProgram.programId,
        })
        .rpc();

    console.log(`Game State PDA: ${gameStatePda.toBase58()}\n`);

    console.log("========================================");
    console.log("  DEPLOY COMPLETE — SQUAD FALL ON DEVNET");
    console.log("========================================");
    console.log(`\nProgram ID:  ${programId.toBase58()}`);
    console.log(`SQUAD Mint:   ${squadMint.toBase58()}`);
    console.log(`Game State:   ${gameStatePda.toBase58()}`);
    console.log(`Reward Vault: ${rewardVault.toBase58()}`);
    console.log(`\nUpdate these in your .env and front-end config.\n`);
}

function gameStateBump() {
    const [_, bump] = PublicKey.findProgramAddressSync(
        [Buffer.from("game-state")], PublicKey.default
    );
    return bump;
}

main().catch(console.error);