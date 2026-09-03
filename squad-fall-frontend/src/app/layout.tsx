// App layout — Phantom Wallet provider + global styles
import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "@/components/WalletProvider";
import { HUD } from "@/components/HUD";

export const metadata: Metadata = {
  title: "Squad Fall — Play to Earn on Solana",
  description: "Tactical top-down shooter. Complete missions. Earn $SQUAD.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white font-mono overflow-hidden">
        <WalletProvider>
          <HUD />
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}