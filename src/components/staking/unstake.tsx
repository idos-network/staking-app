import { useAppKitAccount } from "@reown/appkit/react";
import { useQueryClient } from "@tanstack/react-query";
import { parseUnits } from "viem";
import { useConfig, useReadContract, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import type { NodeProvider } from "@/components/staking/node-provider-selector";
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
import { fromWei } from "@/lib/format";
import { stakeByNodeByUserParams } from "@/lib/queries/query-options";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

export function Unstake({
  selectedProvider,
  onProviderChange,
}: {
  selectedProvider: NodeProvider;
  onProviderChange: (provider: NodeProvider) => void;
}) {
  const { address } = useAppKitAccount();
  const writeContract = useWriteContract();
  const queryClient = useQueryClient();
  const config = useConfig();

  // Fetch staked balance for the selected node provider
  const { data: nodeStake, isLoading: isStakedBalanceLoading } =
    useReadContract(
      stakeByNodeByUserParams(
        address as `0x${string}` | undefined,
        selectedProvider.address
      )
    );

  const stakedBalance = fromWei(nodeStake);

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
      onProviderChange={onProviderChange}
      onSubmit={handleSubmit}
      pending={writeContract.isPending}
      selectedProvider={selectedProvider}
    />
  );
}
