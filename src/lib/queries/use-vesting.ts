import { useState } from "react";
import { useBlockNumber, useContractEvents, useReadContracts } from "wagmi";
import { APP_CHAIN_ID, VESTING_ABI } from "@/lib/abi";
import {
  vestingCliffParams,
  vestingDurationParams,
  vestingOwnerParams,
  vestingReleasableParams,
  vestingReleasedParams,
  vestingStartParams,
  vestingVestedAmountParams,
} from "./query-options";

// Contract address → total allocation (in whole tokens, not wei).
// These are vesting contract addresses, not beneficiary addresses.
export const VESTING_ALLOCATIONS: Record<string, number> = {
  "0x6569b018fDd1D47764654A8231376f6185a85d6D": 283_879,
  "0x76b272A6d3f500379DB63c14913fc92246c52d19": 1_892_523,
  "0x0a327a697B801950C71278659F2d105C3E5B9885": 304_400,
  "0x4c67A5A7fe00073F6F9f732F5b62aa00047C6380": 1_522_000,
  "0xE98aCFD7D9aF4d5dc3250c920d108Ca5A36a2646": 11_682_243,
  "0x9A661572C7CFa780326E44621dCcC6bc298E4793": 500_000,
  "0xfC0bEb2772369b834d2C764C0f08E2e99EE6b335": 254_700,
  "0xe1eE8f731787ED8C837755EbD13eaFEd0C2AaA41": 175_000,
  "0x10A8d76Ce2224AE0b3E1fd85eFE9D6f9306391F1": 160_000,
  "0xdf24F4Ca9984807577d13f5ef24eD26e5AFc7083": 50_000,
  "0x4e070B8c883954DBd36e86433989ABe1016398c5": 80_000,
  "0xA33916c552e5C2c0c7eeC006541994F0c320b196": 40_000,
  "0xBe750bB45088F9f784178014211D3843F5Df9579": 80_000,
  "0x0E76638c60bC91aF9B345cb6aDeFce83b81d476E": 20_000,
  "0xaB8990e9B8a73599Cd50cA7786BC1854fe106484": 60_000,
  "0xba2574ceD333788C901B799C84955d548E22ac8e": 120_000,
  "0x329F47e548C0cd687e014eE7A7Dcd5198E971705": 10_000,
  "0x97E27bA55e409D09d467C29953A16284C866304D": 80_000,
  "0x48Fb081aEeDB1a0a6143E716a839b94e927f82bE": 200_000,
  "0x4D428CeCf85667E1Cb90D24D1130683C78Df48B5": 50_000,
  "0x6066A66B6aA460990Fdd857D6F013d8940d7aBa9": 20_000,
  "0x75Eff561053047E06406a4a822260E2cEB605Cce": 50_000,
  "0xBd9aeE42865F5B1f0a1bb69902F0d7fb7a27524b": 100_000,
  "0x448491096f935d05F8eC9C21efbbcDb0DE12d83C": 150_000,
  "0x43c26DFa982E77445325f81D4F1b57a0599fd9F5": 160_000,
  "0xd6f620608146faD03d2e4a20436d6AF4a6742484": 70_000,
  "0xfF6562209E23F730a6A067642DD8aB67610EF281": 150_000,
  "0x28037144F1c545F05FdA267931e8343a807D596D": 60_000,
  "0x665d94996973Bae324302aE3A314403Fb0cc7f45": 70_000,
  "0xf37A9e6Db21FF47201FA93E370B1e58ba66b39a9": 30_000,
  "0x3d8CD50b54a6F6bC66bdc5c74A3BFC848E7762D9": 12_000,
  "0x6711b8CD3e8b4cA1346f362674f8CFeeE777E891": 30_000,
  "0x4394F73143ede4e3A9626137455cd460f7c132D4": 400_000,
  "0xf482d682F85f65F39AF3da83bCE0eFD3Db16c5D7": 120_000,
  "0x79c164b9b05595e900b295bD80031B62ca1c8851": 120_000,
  "0x4A9D51380B88FCd3807A349EdfC5078687D073e5": 120_000,
  "0x2a7858931b509ac9107404f7EE018707326e8039": 50_000,
  "0xe691c8dfE586193aCFD050D70C76531fd719a962": 20_000,
  "0x3149dcFEcdE1eDC0474Eb09B673c94C7D58Ae4da": 50_000,
  "0xF7b0A56033dBCE49Ed20f034DF3b3b5E1e5602E5": 60_000,
  "0x9fB210F3038D133Dab2b5175ce17Fd7ddA0B59EF": 120_000,
  "0x4418A42DaC69173E82EdA32a7e6442eE3028E93D": 100_000,
};

const VESTING_CONTRACT_ADDRESSES = Object.keys(
  VESTING_ALLOCATIONS
) as `0x${string}`[];

/**
 * Phase 1: Batch owner() calls to find which vesting contract belongs to
 * the connected wallet address.
 */
export function useVestingContract(beneficiary: string | undefined) {
  const ownerCalls = VESTING_CONTRACT_ADDRESSES.map((addr) =>
    vestingOwnerParams(addr)
  );

  const { data: ownerResults, isLoading } = useReadContracts({
    contracts: ownerCalls,
    query: { enabled: !!beneficiary },
  });

  const match = (() => {
    if (!(ownerResults && beneficiary)) {
      return;
    }

    for (let i = 0; i < ownerResults.length; i++) {
      const result = ownerResults[i];
      if (
        result.status === "success" &&
        (result.result as string).toLowerCase() === beneficiary.toLowerCase()
      ) {
        return VESTING_CONTRACT_ADDRESSES[i];
      }
    }
    return;
  })();

  return { contractAddress: match, isLoading };
}

export type VestingData = {
  contractAddress: `0x${string}`;
  totalAllocation: number;
  alreadyClaimed: bigint;
  claimableNow: bigint;
  totalVested: bigint;
  locked: bigint;
  start: bigint;
  end: bigint;
  cliff: bigint;
  duration: bigint;
  isLoading: boolean;
};

/**
 * Phase 2: Read all vesting data from a specific contract in a single multicall.
 */
export function useVestingData(contractAddress: `0x${string}` | undefined) {
  const [now] = useState(() => Math.floor(Date.now() / 1000));

  const contracts = contractAddress
    ? [
        vestingStartParams(contractAddress),
        vestingCliffParams(contractAddress),
        vestingDurationParams(contractAddress),
        vestingReleasedParams(contractAddress),
        vestingReleasableParams(contractAddress),
        vestingVestedAmountParams(contractAddress, now),
      ]
    : [];

  const { data, isLoading } = useReadContracts({
    contracts,
    query: { enabled: !!contractAddress },
  });

  if (!(data && contractAddress)) {
    return;
  }

  const allSucceeded = data.every((r) => r.status === "success");
  if (!allSucceeded) {
    return;
  }

  const start = data[0].result as bigint;
  const cliff = data[1].result as bigint;
  const duration = data[2].result as bigint;
  const alreadyClaimed = data[3].result as bigint;
  const claimableNow = data[4].result as bigint;
  const totalVested = data[5].result as bigint;
  const end = start + duration;

  const totalAllocation = VESTING_ALLOCATIONS[contractAddress] ?? 0;
  const totalAllocationWei = BigInt(totalAllocation) * 10n ** 18n;
  const locked =
    totalAllocationWei > totalVested ? totalAllocationWei - totalVested : 0n;

  return {
    contractAddress,
    totalAllocation,
    alreadyClaimed,
    claimableNow,
    totalVested,
    locked,
    start,
    end,
    cliff,
    duration,
    isLoading,
  };
}

/**
 * Combined hook: finds the user's vesting contract and reads all its data.
 */
export function useVesting(beneficiary: string | undefined) {
  const { contractAddress, isLoading: isFindingContract } =
    useVestingContract(beneficiary);

  const vestingData = useVestingData(contractAddress);

  return {
    ...vestingData,
    contractAddress,
    hasVesting: !!contractAddress,
    isLoading: isFindingContract || (!!contractAddress && !vestingData),
  };
}

export type ClaimEvent = {
  amount: bigint;
  txHash: `0x${string}`;
  blockNumber: bigint;
};

/**
 * Phase 3: Query ERC20Released events for claim history.
 * Filters for events where `token` matches the IDOS token address.
 */
const MAX_BLOCK_RANGE = 49_999n;

export function useVestingClaimHistory(
  contractAddress: `0x${string}` | undefined
) {
  const { data: blockNumber } = useBlockNumber({ chainId: APP_CHAIN_ID });
  const fromBlock = blockNumber ? blockNumber - MAX_BLOCK_RANGE : undefined;

  const { data: logs, isLoading } = useContractEvents({
    address: contractAddress,
    abi: VESTING_ABI,
    eventName: "ERC20Released",
    chainId: APP_CHAIN_ID,
    fromBlock: fromBlock ?? 0n,
    toBlock: "latest",
    query: { enabled: !!contractAddress && !!fromBlock },
  });

  const claimHistory: ClaimEvent[] = logs
    ? logs
        .map((log) => ({
          amount: (log.args as { amount: bigint }).amount,
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
        }))
        .slice(-5)
        .reverse()
    : [];

  return { claimHistory, isLoading };
}
