import { useAppKitAccount } from "@reown/appkit/react";
import { useQueryClient } from "@tanstack/react-query";
import { useConfig, useReadContract, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";

import { ConfirmClaimReward } from "@/components/staking/confirm-claim-reward";
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
  balanceOfParams,
  withdrawableRewardParams,
} from "@/lib/queries/query-options";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

export function ClaimRewards() {
  const { address } = useAppKitAccount();
  const writeContract = useWriteContract();
  const queryClient = useQueryClient();
  const config = useConfig();

  const { data: withdrawableReward, isLoading: isRewardLoading } =
    useReadContract(
      withdrawableRewardParams(address as `0x${string}` | undefined),
    );

  const { data: balance, isLoading: isBalanceLoading } = useReadContract(
    balanceOfParams(address as `0x${string}` | undefined),
  );

  // Extract withdrawableAmount from withdrawableReward result
  // WithdrawableReward returns: [withdrawableAmount, rewardAcc, userStakeAcc, totalStakeAcc]
  const rewardAmount =
    withdrawableReward &&
    Array.isArray(withdrawableReward) &&
    withdrawableReward.length >= 1
      ? fromWei(withdrawableReward[0])
      : 0;

  // Convert bigint balance to number (dividing by 10^18 for 18 decimals)
  const currentBalance = fromWei(balance);

  const handleClaim = async () => {
    if (!address) {
      showErrorToast(
        "Wallet Not Connected",
        "Please connect your wallet to claim rewards.",
      );
      return;
    }

    if (rewardAmount === 0) {
      return;
    }

    try {
      // Claim rewards (withdrawReward takes no args)
      const claimTx = await writeContract.mutateAsync({
        abi: IDOS_NODE_STAKING_ABI,
        address: IDOS_NODE_STAKING_ABI_ADDRESS,
        args: [],
        functionName: "withdrawReward",
      });

      await waitForTransactionReceipt(config, {
        hash: claimTx,
      });

      // Invalidate all readContract queries to ensure fresh data
      queryClient.invalidateQueries({
        predicate: (query) => {
          const { queryKey } = query;
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
        "Rewards Claimed",
        `Successfully claimed ${formatTokenAmount(rewardAmount)} IDOS rewards.`,
      );
    } catch (error) {
      console.error(error);
      // Try both ABIs since errors can come from token contract (ERC20) or staking contract
      const decodedError = decodeTransactionError(error, [
        IDOS_TOKEN_ABI,
        IDOS_NODE_STAKING_ABI,
      ]);
      showErrorToast("Claim Failed", decodedError.message);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex w-full flex-col gap-4">
        <p className="font-semibold">Claim Rewards</p>
        <div className="flex flex-col gap-2 rounded-xl bg-secondary p-6">
          {isRewardLoading || isBalanceLoading ? (
            <>
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-4 w-24" />
            </>
          ) : (
            <>
              <p className="text-lg font-semibold">
                {formatTokenAmount(rewardAmount)} IDOS
              </p>
              <p className="text-sm text-muted-foreground">
                {formatTokenAmount(currentBalance)} IDOS
              </p>
            </>
          )}
        </div>
      </div>

      <ConfirmClaimReward
        amount={rewardAmount}
        onConfirm={handleClaim}
        trigger={
          <Button
            className="w-full sm:w-2xs"
            disabled={rewardAmount === 0 || writeContract.isPending}
            size="lg"
          >
            {writeContract.isPending ? (
              <Spinner className="size-5" />
            ) : (
              "Claim now"
            )}
          </Button>
        }
      />
    </div>
  );
}
