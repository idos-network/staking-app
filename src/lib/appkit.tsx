import { type AppKitNetwork, arbitrum, mainnet } from "@reown/appkit/networks";
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { WagmiProvider } from "wagmi";

const queryClient = new QueryClient();

const projectId =
  import.meta.env.VITE_APPKIT_PROJECT_ID || "b56e18d47c72ab683b10814fe9495694";

const metadata = {
  name: "idOS Staking",
  description: "idOS Staking app",
  url: "http://localhost:5173", // origin must match your domain & subdomain
  icons: ["/favicon.svg"],
};

const networks: [AppKitNetwork, ...AppKitNetwork[]] = [mainnet, arbitrum];

const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
});

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
  },
});

export function AppKitProvider({ children }: PropsWithChildren) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
