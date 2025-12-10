import { useAppKitAccount } from "@reown/appkit/react";
import { useQueryClient } from "@tanstack/react-query";
import { useConfig, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IDOS_NODE_STAKING_ABI,
  IDOS_NODE_STAKING_ABI_ADDRESS,
} from "@/lib/abi";
import { formatTokenAmount } from "@/lib/format";
import { useWithdrawableUnstaked } from "@/lib/queries/use-withdrawable-unstaked";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

export function WithdrawUnstake() {
  const { address } = useAppKitAccount();
  const writeContract = useWriteContract();
  const queryClient = useQueryClient();
  const config = useConfig();

  const { withdrawableAmount, isLoading: isBalanceLoading } =
    useWithdrawableUnstaked(address as `0x${string}` | undefined);

  // Convert bigint balance to number (dividing by 10^18 for 18 decimals)
  const balance = withdrawableAmount
    ? Number(withdrawableAmount) / 10 ** 18
    : 0;

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
      showErrorToast(
        "Withdrawal Failed",
        "An unexpected error occurred. Please try again."
      );
    }
  };

  return (
    <div className="flex flex-col items-center gap-10">
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
      <Button
        className="w-2xs"
        disabled={balance === 0 || writeContract.isPending}
        onClick={handleWithdraw}
        size="lg"
      >
        {writeContract.isPending ? "Withdrawing..." : "Withdraw"}
      </Button>
    </div>
  );
}
