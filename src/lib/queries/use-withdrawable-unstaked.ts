import { useQueries } from "@tanstack/react-query";
import { useBlock, useConfig } from "wagmi";
import { unstakeByUserAtIndexQueryOptions } from "./query-options";

type UnstakeRecord = {
  amount: bigint;
  timestamp: bigint;
};

// UNSTAKE_DELAY is 14 days = 14 * 24 * 60 * 60 = 1,209,600 seconds
const UNSTAKE_DELAY_SECONDS = 14 * 24 * 60 * 60;

function processUnstakeRecord(
  amount: bigint,
  timestamp: bigint,
  currentTimestamp: number,
  delaySeconds: number
): { withdrawable: bigint; pending: bigint } {
  // Check if this record is withdrawable
  // Contract logic: timestamp < block.timestamp - UNSTAKE_DELAY
  // Which is: timestamp + UNSTAKE_DELAY <= block.timestamp
  const timestampNum = Number(timestamp);
  const withdrawableTimestamp = timestampNum + delaySeconds;

  if (withdrawableTimestamp <= currentTimestamp) {
    return { withdrawable: amount, pending: 0n };
  }
  return { withdrawable: 0n, pending: amount };
}

function processUnstakeQueries(
  unstakeQueries: Array<{
    isLoading: boolean;
    error: Error | null;
    data: readonly [bigint, number] | undefined;
  }>,
  currentTimestamp: number,
  delaySeconds: number
): {
  withdrawableAmount: bigint;
  pendingAmount: bigint;
  unstakeRecords: UnstakeRecord[];
  isLoading: boolean;
} {
  const records: UnstakeRecord[] = [];
  let withdrawable = 0n;
  let pending = 0n;

  // Process each query result
  for (const query of unstakeQueries) {
    if (query.isLoading) {
      return {
        withdrawableAmount: 0n,
        pendingAmount: 0n,
        unstakeRecords: [],
        isLoading: true,
      };
    }

    // If query errored, we've likely reached the end of the array (out of bounds)
    if (query.error) {
      break;
    }

    if (query.data) {
      const [amount, timestampNum] = query.data;
      const timestamp = BigInt(timestampNum);

      // If amount is 0, we've reached the end of the array (empty slot)
      // Note: This shouldn't happen in practice since contract requires amount > 0,
      // but it's a safety check
      if (amount === 0n) {
        break;
      }

      const record: UnstakeRecord = {
        amount,
        timestamp,
      };
      records.push(record);

      const result = processUnstakeRecord(
        amount,
        timestamp,
        currentTimestamp,
        delaySeconds
      );
      withdrawable += result.withdrawable;
      pending += result.pending;
    } else if (records.length > 0) {
      // No data and no error means we're still loading or reached the end
      // If we have some records already, assume we've reached the end
      break;
    }
  }

  return {
    withdrawableAmount: withdrawable,
    pendingAmount: pending,
    unstakeRecords: records,
    isLoading: false,
  };
}

/**
 * Custom hook to calculate withdrawable unstaked amount
 * Replicates the logic from withdrawUnstaked() contract function
 */
export function useWithdrawableUnstaked(address: `0x${string}` | undefined) {
  const config = useConfig();

  // Get current block timestamp
  const { data: currentBlock, isLoading: isBlockLoading } = useBlock();

  // Fetch unstake records - start with a smaller batch (20 records)
  // Most users won't have more than a few unstake records
  // If we need more, we can expand this number
  const BATCH_SIZE = 20;
  const unstakeQueries = useQueries({
    queries: Array.from({ length: BATCH_SIZE }, (_, index) =>
      unstakeByUserAtIndexQueryOptions(config, address, index)
    ),
  });

  // Process the results
  const { withdrawableAmount, pendingAmount, unstakeRecords, isLoading } =
    (() => {
      if (!(address && currentBlock)) {
        return {
          withdrawableAmount: 0n,
          pendingAmount: 0n,
          unstakeRecords: [] as UnstakeRecord[],
          isLoading: true,
        };
      }

      const currentTimestamp = Number(currentBlock.timestamp);
      const delaySeconds = UNSTAKE_DELAY_SECONDS;

      return processUnstakeQueries(
        unstakeQueries,
        currentTimestamp,
        delaySeconds
      );
    })();

  return {
    withdrawableAmount,
    pendingAmount,
    unstakeRecords,
    isLoading: isLoading || isBlockLoading,
  };
}
