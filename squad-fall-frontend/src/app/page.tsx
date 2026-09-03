"use client";
import { useEffect, useRef, useState } from "react";
import { useGameStore } from "@/store/useGameStore";
import { useWallet } from "@solana/wallet-adapter-react";

export default function Home() {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserRef = useRef<any>(null);
  const { connected } = useWallet();
  const { status, world, phase, startGame, squadBalance, phaseResult } = useGameStore();
  const [booting, setBooting] = useState(false);

  useEffect(() => {
    if (!connected || status !== "playing" || phaserRef.current || booting) return;
    if (!gameRef.current) return;
    setBooting(true);
    let cancelled = false;
    (async () => {
      const PhaserModule = await import("phaser");
      const { GameScene } = await import("@/game/GameScene");
      const Phaser = (PhaserModule as any).default ?? PhaserModule;
      if (cancelled || !gameRef.current) return;
      phaserRef.current = new Phaser.Game({
        type: Phaser.AUTO,
        parent: gameRef.current,
        width: 1440,
        height: 960,
        backgroundColor: "#1a1a1a",
        scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
        physics: { default: "arcade", arcade: { gravity: { x: 0, y: 0 } } },
        scene: [GameScene],
      });
    })();
    return () => { cancelled = true; phaserRef.current?.destroy(true); phaserRef.current = null; setBooting(false); };
  }, [connected, status, booting]);

  useEffect(() => {
    if (status === "playing" && phaserRef.current) {
      const scene = phaserRef.current.scene.getScene("GameScene") as any;
      scene.scene.restart({ phaseId: phase });
    }
  }, [phase, status]);

  if (!connected) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-green-400 mb-2 tracking-wider">SQUAD FALL</h1>
          <p className="text-gray-400 mb-8 text-sm">Tactical P2E shooter · Solana</p>
          <p className="text-gray-300 mb-4">Conecte sua carteira Phantom para iniciar a missão.</p>
          <p className="text-gray-500 text-xs mt-12">v0.1.0 · Devnet</p>
        </div>
      </main>
    );
  }

  if (status === "menu") {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-green-400 mb-1 tracking-wider">SQUAD FALL</h1>
          <p className="text-gray-400 mb-8 text-sm">Tactical P2E shooter · Solana · Devnet</p>
          <p className="text-gray-300 mb-2">Saldo: <span className="text-green-300 font-bold">{squadBalance} SQUAD</span></p>
          <p className="text-gray-300 mb-6">Continuar a partir de: <span className="text-yellow-400">Mundo {world} · Fase {phase}</span></p>
          <button onClick={startGame} className="bg-green-700 hover:bg-green-500 text-black font-bold px-8 py-3 rounded text-lg transition">
            ▶ INICIAR MISSÃO
          </button>
          <p className="text-gray-500 text-xs mt-12">v0.1.0 · Estado: Protótipo jogável (Mundo 1)</p>
        </div>
      </main>
    );
  }

  if (status === "victory" && phaseResult) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-yellow-400 mb-2">FASE CONCLUÍDA</h1>
          <p className="text-2xl mb-4 text-yellow-300">{"★".repeat(phaseResult.stars)}{"☆".repeat(3 - phaseResult.stars)}</p>
          <p className="text-green-300 text-xl mb-2">+{(useGameStore.getState().squadBalance)} SQUAD</p>
          <p className="text-gray-400 text-sm">Tempo: {phaseResult.time}s · Soldados: {phaseResult.soldiersAlive}/4</p>
          <button onClick={() => useGameStore.getState().setStatus("menu")} className="mt-6 bg-gray-700 hover:bg-gray-500 text-white px-6 py-2 rounded">
            Menu
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black">
      <div ref={gameRef} className="w-full h-full max-w-[1440px] max-h-[960px]" />
    </main>
  );
}
