import { useAppKitAccount } from "@reown/appkit/react";
import { useQueryClient } from "@tanstack/react-query";
import { useConfig, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { ConfirmWithdrawUnstake } from "@/components/staking/confirm-withdraw-unstake";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  IDOS_NODE_STAKING_ABI,
  IDOS_NODE_STAKING_ABI_ADDRESS,
  IDOS_TOKEN_ABI,
} from "@/lib/abi";
import { decodeTransactionError } from "@/lib/decode-error";
import { formatTokenAmount, fromWei } from "@/lib/format";
import {
  UNSTAKE_DELAY_SECONDS,
  type UnstakeRecord,
  useWithdrawableUnstaked,
} from "@/lib/queries/use-withdrawable-unstaked";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

function formatCountdown(secondsRemaining: number): string {
  if (secondsRemaining <= 0) {
    return "Ready";
  }
  const days = Math.floor(secondsRemaining / 86_400);
  const hours = Math.floor((secondsRemaining % 86_400) / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);

  const parts: string[] = [];
  if (days > 0) {
    parts.push(`${days}d`);
  }
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (days === 0 && minutes > 0) {
    parts.push(`${minutes}m`);
  }

  return `${parts.join(" ")} remaining`;
}

function PendingUnbonding({
  records,
  currentTimestamp,
}: {
  records: UnstakeRecord[];
  currentTimestamp: number;
}) {
  const pendingRecords = records.filter((r) => {
    const unlockTime = Number(r.timestamp) + UNSTAKE_DELAY_SECONDS;
    return unlockTime > currentTimestamp;
  });

  if (pendingRecords.length === 0) {
    return null;
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <p className="font-semibold">Pending Unbonding</p>
      <div className="flex flex-col gap-3">
        {pendingRecords.map((record, index) => {
          const unlockTime = Number(record.timestamp) + UNSTAKE_DELAY_SECONDS;
          const secondsRemaining = unlockTime - currentTimestamp;
          return (
            <div
              className="flex items-center justify-between rounded-xl bg-secondary p-4"
              key={`${record.timestamp}-${index}`}
            >
              <span className="text-sm">
                {formatTokenAmount(fromWei(record.amount))} IDOS
              </span>
              <span className="text-muted-foreground text-sm">
                {formatCountdown(secondsRemaining)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function WithdrawUnstake() {
  const { address } = useAppKitAccount();
  const writeContract = useWriteContract();
  const queryClient = useQueryClient();
  const config = useConfig();

  const {
    withdrawableAmount,
    unstakeRecords,
    currentTimestamp,
    isLoading: isBalanceLoading,
  } = useWithdrawableUnstaked(address as `0x${string}` | undefined);

  // Convert bigint balance to number (dividing by 10^18 for 18 decimals)
  const balance = fromWei(withdrawableAmount);

  const handleWithdraw = async () => {
    if (!address) {
      showErrorToast(
        "Wallet Not Connected",
        "Please connect your wallet to withdraw unstaked tokens."
      );
      return;
    }

    if (balance === 0) {
      return;
    }

    try {
      // Withdraw unstaked tokens (withdrawUnstaked takes no args, withdraws all available)
      const withdrawTx = await writeContract.mutateAsync({
        address: IDOS_NODE_STAKING_ABI_ADDRESS,
        abi: IDOS_NODE_STAKING_ABI,
        functionName: "withdrawUnstaked",
        args: [],
      });

      await waitForTransactionReceipt(config, {
        hash: withdrawTx,
      });

      // Invalidate all readContract queries to ensure fresh data
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          // Match all readContract queries
          return (
            Array.isArray(queryKey) &&
            queryKey.length > 0 &&
            queryKey[0] === "readContract"
          );
        },
      });

      // Refetch all stale queries in the background (non-blocking)
      queryClient.refetchQueries({ stale: true });

      showSuccessToast(
        "Withdrawal Successful",
        `Successfully withdrew ${formatTokenAmount(balance)} IDOS tokens.`
      );
    } catch (error) {
      console.error(error);
      // Try both ABIs since errors can come from token contract (ERC20) or staking contract
      const decodedError = decodeTransactionError(error, [
        IDOS_TOKEN_ABI,
        IDOS_NODE_STAKING_ABI,
      ]);
      showErrorToast("Withdrawal Failed", decodedError.message);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex w-full flex-col gap-4">
        <p className="font-semibold">Withdraw Unstaked</p>
        <div className="flex flex-col gap-2 rounded-xl bg-secondary p-6">
          {isBalanceLoading ? (
            <>
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-7 w-32" />
            </>
          ) : (
            <>
              <p className="text-muted-foreground text-sm">
                Available to withdraw
              </p>
              <p className="font-semibold text-lg">
                {formatTokenAmount(balance)} IDOS
              </p>
            </>
          )}
        </div>
      </div>
      {!isBalanceLoading && (
        <PendingUnbonding
          currentTimestamp={currentTimestamp}
          records={unstakeRecords}
        />
      )}
      <ConfirmWithdrawUnstake
        amount={balance}
        onConfirm={() => {
          handleWithdraw();
        }}
        trigger={
          <Button
            className="w-full sm:w-2xs"
            disabled={balance === 0 || writeContract.isPending}
            size="lg"
          >
            {writeContract.isPending ? (
              <Spinner className="size-4" />
            ) : (
              "Withdraw"
            )}
          </Button>
        }
      />
    </div>
  );
}
