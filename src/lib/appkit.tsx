import {
  type AppKitNetwork,
  arbitrum,
  arbitrumSepolia,
  mainnet,
  sepolia,
} from "@reown/appkit/networks";
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import type { PropsWithChildren } from "react";
import { http, WagmiProvider } from "wagmi";
import { arbitrum as wagmiArbitrum } from "wagmi/chains";

const projectId =
  import.meta.env.VITE_APPKIT_PROJECT_ID || "b56e18d47c72ab683b10814fe9495694";

const url = import.meta.env.DEV
  ? "http://localhost:5173"
  : "https://portal.idos.network/";

const metadata = {
  name: "idOS Staking",
  description: "idOS Staking app",
  url, // origin must match your domain & subdomain
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
  networks,
  projectId,
  metadata,
  features: {
    socials: false,
    email: false,
    analytics: true, // Optional - defaults to your Cloud configuration
  },
});

export function AppKitProvider({ children }: PropsWithChildren) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>{children}</WagmiProvider>
  );
}
