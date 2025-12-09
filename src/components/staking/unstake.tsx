import { useAppKitAccount } from "@reown/appkit/react";
import { useQueryClient } from "@tanstack/react-query";
import { parseUnits } from "viem";
import { useConfig, useWriteContract } from "wagmi";
import { readContractQueryOptions } from "wagmi/query";
import {
  StakingForm,
  type StakingFormSubmitData,
} from "@/components/staking/staking-form";
import {
  IDOS_NODE_STAKING_ABI,
  IDOS_NODE_STAKING_ABI_ADDRESS,
  IDOS_TOKEN_ABI,
  IDOS_TOKEN_ABI_ADDRESS,
} from "@/lib/abi";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

export function Unstake() {
  const { address } = useAppKitAccount();
  const config = useConfig();
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
          // Refetch balance, userStake, and withdrawableReward queries
          if (address) {
            // Refetch balance
            queryClient.refetchQueries({
              queryKey: readContractQueryOptions(config, {
                address: IDOS_TOKEN_ABI_ADDRESS,
                abi: IDOS_TOKEN_ABI,
                functionName: "balanceOf",
                args: [address as `0x${string}`],
              }).queryKey,
            });

            // Refetch user stake
            queryClient.refetchQueries({
              queryKey: readContractQueryOptions(config, {
                address: IDOS_NODE_STAKING_ABI_ADDRESS,
                abi: IDOS_NODE_STAKING_ABI,
                functionName: "getUserStake",
                args: [address as `0x${string}`],
              }).queryKey,
            });

            // Refetch withdrawable reward
            queryClient.refetchQueries({
              queryKey: readContractQueryOptions(config, {
                address: IDOS_NODE_STAKING_ABI_ADDRESS,
                abi: IDOS_NODE_STAKING_ABI,
                functionName: "withdrawableReward",
                args: [address as `0x${string}`],
              }).queryKey,
            });
          }

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
