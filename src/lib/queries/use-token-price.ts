import { useQuery } from "@tanstack/react-query";
import { useChainId } from "wagmi";

// CoinGecko API endpoint for token price
// Format: https://api.coingecko.com/api/v3/simple/token_price/{chainId}?contract_addresses={address}&vs_currencies=usd
// const COINGECKO_API_BASE = "https://api.coingecko.com/api/v3";

// Map chain IDs to CoinGecko platform IDs
// const CHAIN_TO_PLATFORM: Record<number, string> = {
//   1: "ethereum", // Ethereum Mainnet
//   42161: "arbitrum-one", // Arbitrum One
//   421614: "arbitrum-sepolia", // Arbitrum Sepolia (may not be supported)
// };

function fetchTokenPrice(
  _contractAddress: string,
  _chainId: number
): Promise<number | null> {
  // TODO: Replace with actual CoinGecko API call when ready
  // For now, return a hardcoded price for development
  return Promise.resolve(3.06); // Hardcoded price in USD

  // const platform = CHAIN_TO_PLATFORM[chainId];
  // if (!platform) {
  //   console.warn(`Chain ID ${chainId} not supported by CoinGecko`);
  //   return null;
  // }

  // try {
  //   const url = `${COINGECKO_API_BASE}/simple/token_price/${platform}?contract_addresses=${contractAddress}&vs_currencies=usd`;
  //   const response = await fetch(url);

  //   if (!response.ok) {
  //     throw new Error(`Failed to fetch price: ${response.statusText}`);
  //   }

  //   const data = await response.json();
  //   const price = data[contractAddress.toLowerCase()]?.usd;

  //   return price ?? null;
  // } catch (error) {
  //   console.error("Error fetching token price:", error);
  //   return null;
  // }
}

export function useTokenPrice(contractAddress: string) {
  const chainId = useChainId();

  return useQuery({
    queryKey: ["tokenPrice", contractAddress, chainId],
    queryFn: () => fetchTokenPrice(contractAddress, chainId),
    enabled: !!contractAddress,
    refetchInterval: 60_000, // Refetch every minute
    staleTime: 30_000, // Consider data stale after 30 seconds
  });
}
