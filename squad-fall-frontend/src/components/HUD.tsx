// HUD — Always-visible overlay (wallet button, SQUAD balance, lives)
"use client";
import { useGameStore } from "@/store/useGameStore";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";

export function HUD() {
  const { lives, phase, world, squadBalance } = useGameStore();
  const { connected, publicKey } = useWallet();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2 bg-black/70 backdrop-blur border-b border-green-900/50">
      <div className="flex items-center gap-4 text-xs sm:text-sm">
        {connected && (
          <>
            <span className="text-green-400 font-bold">SQUAD FALL</span>
            <span className="text-gray-500">|</span>
            <span className="text-white">
              Mundo <span className="text-yellow-400">{world || 1}</span>
            </span>
            <span className="text-gray-500">|</span>
            <span className="text-white">
              Fase <span className="text-yellow-400">{phase || 1}</span>
            </span>
            <span className="text-gray-500">|</span>
            <span className="text-red-400">
              ❤️ {lives}
            </span>
            <span className="text-gray-500">|</span>
            <span className="text-green-300">
              💰 {squadBalance} SQUAD
            </span>
          </>
        )}
        {!connected && (
          <span className="text-gray-400">Conecte a Phantom para jogar</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        {connected && (
          <span className="text-xs text-gray-400 hidden sm:inline">
            {publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)}
          </span>
        )}
        <WalletMultiButton className="!bg-green-700 !text-black !font-bold !text-xs !py-1 !h-8 hover:!bg-green-500 transition" />
      </div>
    </div>
  );
}