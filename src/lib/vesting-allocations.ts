import { useQuery } from "@tanstack/react-query";

type VestingAllocationEntry = {
  beneficiary: string;
  transferTarget: string;
};

export type VestingByOwner = Record<string, `0x${string}`[]>;

const ALLOCATIONS_URL = import.meta.env.VITE_VESTING_ALLOCATIONS_URL as
  | string
  | undefined;

function transformAllocations(
  entries: VestingAllocationEntry[]
): VestingByOwner {
  const map: VestingByOwner = {};
  for (const { beneficiary, transferTarget } of entries) {
    const contracts = map[beneficiary] ?? [];
    contracts.push(transferTarget as `0x${string}`);
    map[beneficiary] = contracts;
  }
  return map;
}

export function useVestingAllocations() {
  return useQuery<VestingByOwner>({
    queryKey: ["vestingAllocations"],
    queryFn: async () => {
      if (!ALLOCATIONS_URL) {
        return {};
      }
      const res = await fetch(ALLOCATIONS_URL);
      if (!res.ok) {
        throw new Error("Failed to fetch vesting allocations");
      }
      const entries: VestingAllocationEntry[] = await res.json();
      return transformAllocations(entries);
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}
