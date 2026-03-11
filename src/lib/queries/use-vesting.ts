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
    abi: IDOS_TOKEN_ABI,
    address: VESTING_TOKEN_ADDRESS,
    args: [vestingContract] as const,
    chainId: APP_CHAIN_ID,
    functionName: "balanceOf" as const,
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
  contractAddresses: `0x${string}`[] | undefined,
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
    query: {
      enabled: contractAddresses !== undefined && contractAddresses.length > 0,
    },
  });

  if (!(data && contractAddresses)) {
    return { isLoading, vestingContracts: undefined };
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
      alreadyClaimed,
      claimableNow,
      cliff,
      contractAddress: contractAddresses[i],
      duration,
      end,
      locked,
      start,
      totalAllocation,
      totalVested,
    });
  }

  return { isLoading, vestingContracts };
}

export type VestingResult = {
  contracts: VestingData[];
  contractAddresses: `0x${string}`[];
  hasVesting: boolean;
  isLoading: boolean;
};

// TODO: remove before merging — set to true to render the UI with fake data.
const USE_MOCK_VESTING = true;

function getMockVesting(): VestingResult {
  const now = BigInt(Math.floor(Date.now() / 1000));
  const month = 30n * 24n * 60n * 60n;
  const wei = 10n ** 18n;

  const start1 = now - 2n * month;
  const duration1 = 18n * month;
  const total1 = 100_000n * wei;

  const start2 = now - 10n * month;
  const duration2 = 18n * month;
  const total2 = 250_000n * wei;
  const vested2 = (total2 * 10n) / 18n;
  const claimed2 = 50_000n * wei;

  const contracts: VestingData[] = [
    {
      contractAddress: "0x1111111111111111111111111111111111111111",
      start: start1,
      cliff: start1 + 6n * month,
      duration: duration1,
      end: start1 + duration1,
      totalAllocation: total1,
      totalVested: 0n,
      alreadyClaimed: 0n,
      claimableNow: 0n,
      locked: total1,
    },
    {
      contractAddress: "0x2222222222222222222222222222222222222222",
      start: start2,
      cliff: start2 + 6n * month,
      duration: duration2,
      end: start2 + duration2,
      totalAllocation: total2,
      totalVested: vested2,
      alreadyClaimed: claimed2,
      claimableNow: vested2 - claimed2,
      locked: total2 - vested2,
    },
  ];

  return {
    contractAddresses: contracts.map((c) => c.contractAddress),
    contracts,
    hasVesting: true,
    isLoading: false,
  };
}

/**
 * Combined hook: finds the user's vesting contracts from the static map
 * and reads all on-chain data in a single multicall.
 */
export function useVesting(beneficiary: string | undefined): VestingResult {
  const { contractAddresses, isLoading: isLoadingContracts } =
    useVestingContracts(beneficiary as `0x${string}` | undefined);

  const { vestingContracts, isLoading: isLoadingData } =
    useMultiVestingData(contractAddresses);

  if (USE_MOCK_VESTING) {
    return getMockVesting();
  }

  const isLoading =
    isLoadingContracts ||
    isLoadingData ||
    (contractAddresses !== undefined &&
      contractAddresses.length > 0 &&
      !vestingContracts);

  return {
    contractAddresses: contractAddresses ?? [],
    contracts: vestingContracts ?? [],
    hasVesting: contractAddresses !== undefined && contractAddresses.length > 0,
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
  const enabled = contractAddresses.length > 0 && Boolean(fromBlock);

  const { data: logs, isLoading } = useContractEvents({
    abi: VESTING_ABI,
    address: enabled ? ([...contractAddresses] as `0x${string}`[]) : undefined,
    chainId: APP_CHAIN_ID,
    eventName: "ERC20Released",
    fromBlock: fromBlock ?? 0n,
    query: { enabled },
    toBlock: "latest",
  });

  const claimHistory: ClaimEvent[] = logs
    ? logs
        .map((log) => ({
          amount: (log.args as { amount: bigint }).amount,
          blockNumber: log.blockNumber,
          txHash: log.transactionHash,
        }))
        .sort((a, b) => Number(b.blockNumber - a.blockNumber))
        .slice(0, 10)
    : [];

  return { claimHistory, isLoading };
}
