import { useAppKitAccount } from "@reown/appkit/react";
import { useQueryClient } from "@tanstack/react-query";
import { parseUnits } from "viem";
import { useWriteContract } from "wagmi";
import {
  StakingForm,
  type StakingFormSubmitData,
} from "@/components/staking/staking-form";
import {
  IDOS_NODE_STAKING_ABI,
  IDOS_NODE_STAKING_ABI_ADDRESS,
} from "@/lib/abi";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

export function Unstake() {
  const { address } = useAppKitAccount();
  const writeContract = useWriteContract();
  const queryClient = useQueryClient();

  const handleSubmit = (data: StakingFormSubmitData) => {
    if (!address) {
      showErrorToast(
        "Wallet Not Connected",
        "Please connect your wallet to unstake tokens."
      );
      return;
    }

    // Convert amount from token units to wei (18 decimals) using parseUnits for precision
    const amountInWei = parseUnits(data.amount.toString(), 18);

    // Unstake tokens (no approval needed for unstaking)
    writeContract.mutate(
      {
        address: IDOS_NODE_STAKING_ABI_ADDRESS,
        abi: IDOS_NODE_STAKING_ABI,
        functionName: "unstake",
        args: [data.provider.address, amountInWei],
      },
      {
        onSuccess: () => {
          // Invalidate all readContract queries to ensure fresh data
          // This is more aggressive but ensures all related queries are updated
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
            "Unstaking Successful",
            `Successfully unstaked ${data.amount} IDOS tokens.`
          );
        },
        onError: () => {
          showErrorToast(
            "Unstaking Failed",
            "An unexpected error occurred. Please try again."
          );
        },
      }
    );
  };

  return (
    <StakingForm
      mode="unstake"
      onSubmit={handleSubmit}
      pending={writeContract.isPending}
    />
  );
}
