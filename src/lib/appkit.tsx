import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import {
  type AppKitNetwork,
  arbitrum,
  arbitrumSepolia,
  mainnet,
  sepolia,
} from "@reown/appkit/networks";
import { createAppKit } from "@reown/appkit/react";
import type { PropsWithChildren } from "react";
import { WagmiProvider, http } from "wagmi";
import { arbitrum as wagmiArbitrum } from "wagmi/chains";

const projectId = import.meta.env.VITE_APPKIT_PROJECT_ID;

if (!projectId) {
  throw new Error("Missing VITE_APPKIT_PROJECT_ID");
}

const url = import.meta.env.DEV
  ? "http://localhost:5173"
  : "https://portal.idos.network/";

const metadata = {
  name: "idOS Staking",
  description: "idOS Staking app",
  url, // Origin must match your domain & subdomain
  icons: ["/favicon.svg"],
};

const networks: [AppKitNetwork, ...AppKitNetwork[]] = [
  mainnet,
  arbitrum,
  sepolia,
  arbitrumSepolia,
];

const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
  transports: {
    [wagmiArbitrum.id]: http("https://arb1.arbitrum.io/rpc"),
  },
});

createAppKit({
  adapters: [wagmiAdapter],
  features: {
    analytics: true,
    email: false,
    socials: false, // Optional - defaults to your Cloud configuration
  },
  metadata,
  networks,
  projectId,
});

export function AppKitProvider({ children }: PropsWithChildren) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>{children}</WagmiProvider>
  );
}
