import { useQuery } from "@tanstack/react-query";

export type VestingByOwner = Record<string, `0x${string}`[]>;

const ALLOCATIONS_URL = import.meta.env.VITE_VESTING_ALLOCATIONS_URL as
  | string
  | undefined;

// Fallback for local dev or when the blob URL is not configured.
const STATIC_ALLOCATIONS: VestingByOwner = {
  "0x38F69935d956CfA59AEe22FF6450A6eBee85A4A4": [
    "0x89933ca3705e2996878b21c96ff352205306110b",
    "0xab13479f2d740d6fb32316f69b0f5f0655bc08e9",
    "0x441013a3234f54660f212fb74ffd38af04de3808",
  ],
  "0x7fE6Ad9ffe5a479eBd9eDe726207FdEc9cF3d61F": [
    "0x9a9f25a8df4a6ca156abac441a0c0d4c9bdca832",
    "0x8737164837b5f7d667d73d4467ac70c95d083195",
  ],
  "0x952d05A4Ca689F5E1aEa78cB907Fe6bb027E6983": [
    "0x445f2c4ce877c427d6e5cee1726b54d221c54244",
    "0x2b7facecf122b79081697ac4206709f71c192040",
  ],
};

export function useVestingAllocations() {
  return useQuery<VestingByOwner>({
    queryKey: ["vestingAllocations"],
    queryFn: async () => {
      if (!ALLOCATIONS_URL) {
        return STATIC_ALLOCATIONS;
      }
      const res = await fetch(ALLOCATIONS_URL);
      if (!res.ok) {
        throw new Error("Failed to fetch vesting allocations");
      }
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
    placeholderData: STATIC_ALLOCATIONS,
  });
}
