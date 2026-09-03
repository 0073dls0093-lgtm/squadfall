# Squad Fall — P2E Tactical Shooter on Solana

Top-down tactical shooter inspired by classic 90s squad shooters. Players complete missions across 5 worlds (30 phases), earning `$SQUAD` tokens on Solana via Phantom Wallet.

## Technologies

- **Blockchain**: Solana (Devnet for now, Mainnet target)
- **Token**: $SQUAD (SPL Token, 9 decimals, 500M supply)
- **Smart Contract**: Rust + Anchor Framework 0.30
- **Front-end**: Next.js 14 + React 18 + TypeScript
- **Game Engine**: Phaser.js 3.80 (2D top-down, WebGL/Canvas)
- **Wallet**: @solana/wallet-adapter + Phantom
- **State**: Zustand
- **Styling**: TailwindCSS (planned)

## Project Structure

```
squad-fall/                    # Anchor program (smart contract)
├── programs/squad-fall/src/lib.rs   # 580 lines Rust — token, rewards, staking
├── tests/squad-fall.ts              # 16 test scenarios
├── scripts/deploy.ts                # Devnet deploy script
├── Anchor.toml
├── Cargo.toml
├── package.json
└── install-windows.ps1             # Windows install helper

squad-fall-frontend/           # Next.js + Phaser game client
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout + Wallet provider
│   │   ├── page.tsx                # Menu / game / victory screens
│   │   └── globals.css
│   ├── components/
│   │   ├── WalletProvider.tsx      # Phantom + Solana wallet adapter
│   │   └── HUD.tsx                 # Top overlay (balance, lives, phase)
│   ├── game/
│   │   └── GameScene.ts            # Phaser scene — movement, shooting, enemies, extraction
│   └── store/
│       └── useGameStore.ts         # Zustand store — game state sync
├── package.json
├── tsconfig.json
└── next.config.js

outputs/last-squad-gdd.pdf      # Game Design Document (11 pages, 30 phases, tokenomics)
```

## How to Install (Windows)

1. **Install Rust**: Download `rustup-init.exe` from https://rustup.rs, run, choose option 1.
2. **Install Node.js**: Download from https://nodejs.org (v20+).
3. **Install Solana CLI**: See https://solana.com/pt/docs/intro/installation
4. **Install Anchor**: `cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked`
5. Or run the helper: `powershell -ExecutionPolicy Bypass -File squad-fall/install-windows.ps1`

## How to Run

### Smart Contract (Devnet)
```bash
cd squad-fall
solana config set --url devnet
solana airdrop 5
anchor test           # Run 16 test scenarios
anchor deploy --provider.cluster devnet
```

### Front-end (Game)
```bash
cd squad-fall-frontend
npm install
npm run dev            # http://localhost:3000
```

## How to Test

- **Contract**: `anchor test` in `squad-fall/` — runs 16 scenarios covering token mint, staking, phase completion, anti-farming, cooldowns, edge cases.
- **Game**: Open `http://localhost:3000`, connect Phantom, click "Iniciar Missão", play with WASD + mouse.

## Current State and Limitations

### Implemented (Functional)
- Game Design Document (11 pages, 30 phases detailed, tokenomics, architecture, roadmap)
- Anchor Program in Rust (580 lines): token mint, reward distribution, staking, anti-farming
- Test suite (16 scenarios) — written but NOT yet executed (requires Anchor CLI installed locally)
- Front-end scaffold: Next.js layout, Phantom wallet integration, HUD, Zustand store
- Phaser GameScene: movement (WASD + click), shooting (right-click), enemies, extraction, victory screen
- 3 playable phases (1-1, 1-2, 1-3) of 30 planned

### NOT Implemented / Limitations
- Token $SQUAD NOT yet deployed on-chain (code is ready, needs `anchor deploy` with local Solana CLI)
- Tests NOT yet executed (need Anchor CLI on local machine)
- No actual on-chain reward minting from the game client (mock balance in Zustand only)
- Phases 4-30 not built (only 3 phases have data in PHASES object)
- No server-side validation (the `server_signature` in `complete_phase` is mocked)
- No audio, no sprites (rectangles represent soldiers/enemies)
- No NFT marketplace, no leaderboard, no multiplayer
- No audit performed on the Anchor program
- Mobile touch controls not implemented

### Key Design Decisions
- **Solana over BSC**: Chosen for sub-second confirmation, low fees, Phantom UX, gaming ecosystem (MagicBlock, Sonic SVM)
- **Rust + Anchor**: Solana's native program framework, steeper curve but better tooling for SPL tokens
- **Phaser.js**: Mature 2D game engine, integrates with React via refs, no canvas conflicts
- **Zustand**: Lightweight state sync between Phaser scene and React HUD without Redux overhead
- **Mock rewards**: Game updates a local Zustand balance; real on-chain minting requires the deployed contract + server signature integration (not yet wired)

## License

Proprietary — Squad Fall. All rights reserved.