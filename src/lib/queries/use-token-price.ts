import { useQuery } from "@tanstack/react-query";
import { useChainId } from "wagmi";

const ZERION_API_BASE = "https://api.zerion.io/v1";

const COINGECKO_API_BASE = "https://api.coingecko.com/api/v3";

const CHAIN_TO_PLATFORM: Record<number, string> = {
  1: "ethereum",
  42161: "arbitrum-one",
};

export async function fetchZerionPrice(
  contractAddress: string,
  apiKey: string,
): Promise<number | null> {
  if (!apiKey) {
    return null;
  }

  const url = `${ZERION_API_BASE}/fungibles/${contractAddress}?currency=usd`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Basic ${btoa(`${apiKey}:`)}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  const json = await response.json();
  return json?.data?.attributes?.market_data?.price ?? null;
}

export async function fetchCoinGeckoPrice(
  contractAddress: string,
  chainId: number,
): Promise<number | null> {
  const platform = CHAIN_TO_PLATFORM[chainId];
  if (!platform) {
    return null;
  }

  const url = `${COINGECKO_API_BASE}/simple/token_price/${platform}?contract_addresses=${contractAddress}&vs_currencies=usd`;
  const response = await fetch(url);

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data[contractAddress.toLowerCase()]?.usd ?? null;
}

export async function fetchTokenPrice(
  contractAddress: string,
  chainId: number,
): Promise<number | null> {
  const apiKey = import.meta.env.VITE_ZERION_API_KEY ?? "";

  try {
    const zerionPrice = await fetchZerionPrice(contractAddress, apiKey);
    if (zerionPrice !== null) {
      return zerionPrice;
    }
  } catch {
    // Zerion failed, try CoinGecko
  }

  try {
    return await fetchCoinGeckoPrice(contractAddress, chainId);
  } catch {
    return null;
  }
}

export function useTokenPrice(contractAddress: string) {
  const chainId = useChainId();

  return useQuery({
    enabled: Boolean(contractAddress),
    queryFn: () => fetchTokenPrice(contractAddress, chainId),
    queryKey: ["tokenPrice", contractAddress, chainId],
    refetchInterval: 60_000,
    retry: 3,
    staleTime: 30_000,
  });
}
