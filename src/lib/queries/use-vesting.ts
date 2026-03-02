import { useState } from "react";
import { useBlockNumber, useContractEvents, useReadContracts } from "wagmi";
import {
  APP_CHAIN_ID,
  IDOS_TOKEN_ABI,
  VESTING_ABI,
  VESTING_TOKEN_ADDRESS,
} from "@/lib/abi";
import { useVestingContracts } from "@/lib/vesting-allocations";
import {
  vestingCliffParams,
  vestingDurationParams,
  vestingReleasableParams,
  vestingReleasedParams,
  vestingStartParams,
  vestingVestedAmountParams,
} from "./query-options";

function vestingTokenBalanceParams(vestingContract: `0x${string}`) {
  return {
    address: VESTING_TOKEN_ADDRESS,
    abi: IDOS_TOKEN_ABI,
    functionName: "balanceOf" as const,
    args: [vestingContract] as const,
    chainId: APP_CHAIN_ID,
  };
}

const CALLS_PER_CONTRACT = 7;

export type VestingData = {
  contractAddress: `0x${string}`;
  totalAllocation: bigint;
  alreadyClaimed: bigint;
  claimableNow: bigint;
  totalVested: bigint;
  locked: bigint;
  start: bigint;
  end: bigint;
  cliff: bigint;
  duration: bigint;
};

/**
 * Reads on-chain vesting data for multiple contracts in a single multicall.
 */
export function useMultiVestingData(
  contractAddresses: `0x${string}`[] | undefined
) {
  const [now] = useState(() => Math.floor(Date.now() / 1000));

  const contracts = contractAddresses
    ? contractAddresses.flatMap((addr) => [
        vestingStartParams(addr),
        vestingCliffParams(addr),
        vestingDurationParams(addr),
        vestingReleasedParams(addr),
        vestingReleasableParams(addr),
        vestingVestedAmountParams(addr, now),
        vestingTokenBalanceParams(addr),
      ])
    : [];

  const { data, isLoading } = useReadContracts({
    contracts,
    query: { enabled: !!contractAddresses && contractAddresses.length > 0 },
  });

  if (!(data && contractAddresses)) {
    return { vestingContracts: undefined, isLoading };
  }

  const vestingContracts: VestingData[] = [];

  for (let i = 0; i < contractAddresses.length; i++) {
    const offset = i * CALLS_PER_CONTRACT;
    const slice = data.slice(offset, offset + CALLS_PER_CONTRACT);

    if (
      slice.length < CALLS_PER_CONTRACT ||
      slice.some((r) => r.status !== "success")
    ) {
      continue;
    }

    const start = slice[0].result as bigint;
    const cliff = slice[1].result as bigint;
    const duration = slice[2].result as bigint;
    const alreadyClaimed = slice[3].result as bigint;
    const claimableNow = slice[4].result as bigint;
    const totalVested = slice[5].result as bigint;
    const tokenBalance = slice[6].result as bigint;
    const end = start + duration;

    const totalAllocation = tokenBalance + alreadyClaimed;
    const locked =
      totalAllocation > totalVested ? totalAllocation - totalVested : 0n;

    vestingContracts.push({
      contractAddress: contractAddresses[i],
      totalAllocation,
      alreadyClaimed,
      claimableNow,
      totalVested,
      locked,
      start,
      end,
      cliff,
      duration,
    });
  }

  return { vestingContracts, isLoading };
}

export type VestingResult = {
  contracts: VestingData[];
  contractAddresses: `0x${string}`[];
  hasVesting: boolean;
  isLoading: boolean;
};

/**
 * Combined hook: finds the user's vesting contracts from the static map
 * and reads all on-chain data in a single multicall.
 */
export function useVesting(beneficiary: string | undefined): VestingResult {
  const { contractAddresses, isLoading: isLoadingContracts } =
    useVestingContracts(beneficiary as `0x${string}` | undefined);

  const { vestingContracts, isLoading: isLoadingData } =
    useMultiVestingData(contractAddresses);

  const isLoading =
    isLoadingContracts ||
    isLoadingData ||
    (!!contractAddresses && contractAddresses.length > 0 && !vestingContracts);

  return {
    contracts: vestingContracts ?? [],
    contractAddresses: contractAddresses ?? [],
    hasVesting: !!contractAddresses && contractAddresses.length > 0,
    isLoading,
  };
}

export type ClaimEvent = {
  amount: bigint;
  txHash: `0x${string}`;
  blockNumber: bigint;
};

const MAX_BLOCK_RANGE = 49_999n;

/**
 * Queries ERC20Released events across multiple vesting contracts
 * and merges them into a single chronological list (newest first).
 */
export function useVestingClaimHistory(contractAddresses: `0x${string}`[]) {
  const { data: blockNumber } = useBlockNumber({ chainId: APP_CHAIN_ID });
  const fromBlock = blockNumber ? blockNumber - MAX_BLOCK_RANGE : undefined;
  const enabled = contractAddresses.length > 0 && !!fromBlock;

  const { data: logs, isLoading } = useContractEvents({
    address: enabled ? ([...contractAddresses] as `0x${string}`[]) : undefined,
    abi: VESTING_ABI,
    eventName: "ERC20Released",
    chainId: APP_CHAIN_ID,
    fromBlock: fromBlock ?? 0n,
    toBlock: "latest",
    query: { enabled },
  });

  const claimHistory: ClaimEvent[] = logs
    ? logs
        .map((log) => ({
          amount: (log.args as { amount: bigint }).amount,
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
        }))
        .sort((a, b) => Number(b.blockNumber - a.blockNumber))
        .slice(0, 10)
    : [];

  return { claimHistory, isLoading };
}
