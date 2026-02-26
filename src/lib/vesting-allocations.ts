export type VestingEntry = {
  contract: `0x${string}`;
  allocation: number;
};

// Owner address → list of vesting contracts with their allocations.
// Keys are case-sensitive — use checksummed addresses.
export const VESTING_BY_OWNER: Record<string, VestingEntry[]> = {
  "0x38F69935d956CfA59AEe22FF6450A6eBee85A4A4": [
    {
      contract: "0x89933ca3705e2996878b21c96ff352205306110b",
      allocation: 12_345,
    },
    {
      contract: "0xab13479f2d740d6fb32316f69b0f5f0655bc08e9",
      allocation: 67_890,
    },
  ],
  "0x7fE6Ad9ffe5a479eBd9eDe726207FdEc9cF3d61F": [
    {
      contract: "0x9a9f25a8df4a6ca156abac441a0c0d4c9bdca832",
      allocation: 36_000,
    },
  ],
  "0x952d05A4Ca689F5E1aEa78cB907Fe6bb027E6983": [
    {
      contract: "0x445f2c4ce877c427d6e5cee1726b54d221c54244",
      allocation: 42_069,
    },
  ],
};
