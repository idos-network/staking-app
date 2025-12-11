import { useAppKitAccount } from "@reown/appkit/react";
import { useQueryClient } from "@tanstack/react-query";
import { parseUnits } from "viem";
import { useConfig, useReadContract, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import {
  StakingForm,
  type StakingFormSubmitData,
} from "@/components/staking/staking-form";
import {
  IDOS_NODE_STAKING_ABI,
  IDOS_NODE_STAKING_ABI_ADDRESS,
  IDOS_TOKEN_ABI,
} from "@/lib/abi";
import { decodeTransactionError } from "@/lib/decode-error";
import { getUserStakeParams } from "@/lib/queries/query-options";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

export function Unstake() {
  const { address } = useAppKitAccount();
  const writeContract = useWriteContract();
  const queryClient = useQueryClient();
  const config = useConfig();

  // Fetch staked balance
  const { data: userStake, isLoading: isStakedBalanceLoading } =
    useReadContract(getUserStakeParams(address as `0x${string}` | undefined));

  // Calculate total staked: activeStake + slashedStake
  const stakedBalance =
    userStake && Array.isArray(userStake) && userStake.length >= 2
      ? Number(BigInt(userStake[0]) + BigInt(userStake[1])) / 10 ** 18
      : 0;

  const handleSubmit = async (data: StakingFormSubmitData) => {
    if (!address) {
      showErrorToast(
        "Wallet Not Connected",
        "Please connect your wallet to unstake tokens."
      );
      return;
    }

    // Convert amount from token units to wei (18 decimals) using parseUnits for precision
    const amountInWei = parseUnits(data.amount.toString(), 18);

    try {
      // Unstake tokens (no approval needed for unstaking)
      const unstakeTx = await writeContract.mutateAsync({
        address: IDOS_NODE_STAKING_ABI_ADDRESS,
        abi: IDOS_NODE_STAKING_ABI,
        functionName: "unstake",
        args: [data.provider.address, amountInWei],
      });

      await waitForTransactionReceipt(config, {
        hash: unstakeTx,
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
        "Unstaking Successful",
        `Successfully unstaked ${data.amount} IDOS tokens.`
      );
    } catch (error) {
      console.error(error);
      // Try both ABIs since errors can come from token contract (ERC20) or staking contract
      const decodedError = decodeTransactionError(error, [
        IDOS_TOKEN_ABI,
        IDOS_NODE_STAKING_ABI,
      ]);
      showErrorToast("Unstaking Failed", decodedError.message);
    }
  };

  return (
    <StakingForm
      balance={stakedBalance}
      isBalanceLoading={isStakedBalanceLoading}
      mode="unstake"
      onSubmit={handleSubmit}
      pending={writeContract.isPending}
    />
  );
}
