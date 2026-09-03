"use client";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { clusterApiUrl } from "@solana/web3.js";
import { useMemo, type ComponentType, type ReactNode } from "react";

require("@solana/wallet-adapter-react-ui/styles.css");

type ProviderProps = { children?: ReactNode; endpoint?: string; wallets?: unknown[]; autoConnect?: boolean };
const CompatibleConnectionProvider = ConnectionProvider as unknown as ComponentType<ProviderProps>;
const CompatibleWalletProvider = SolanaWalletProvider as unknown as ComponentType<ProviderProps>;

export function WalletProvider({ children }: { children: ReactNode }) {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <CompatibleConnectionProvider endpoint={endpoint}>
      <CompatibleWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </CompatibleWalletProvider>
    </CompatibleConnectionProvider>
  );
}
