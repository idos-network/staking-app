import { useAppKitAccount } from "@reown/appkit/react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { parseUnits } from "viem";
import { useConfig, useReadContract, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { getRandomProvider } from "@/components/staking/node-provider-selector";
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
import { decodeTransactionError } from "@/lib/decode-error";
import { fromWei } from "@/lib/format";
import { balanceOfParams } from "@/lib/queries/query-options";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

export function Stake({
  onAmountChange,
}: {
  onAmountChange?: (amount: number | null) => void;
}) {
  const { address } = useAppKitAccount();
  const writeContract = useWriteContract();
  const queryClient = useQueryClient();
  const [selectedProvider, setSelectedProvider] = useState(getRandomProvider);

  const config = useConfig();

  // Fetch available balance
  const { data: balance, isLoading: isBalanceLoading } = useReadContract(
    balanceOfParams(address as `0x${string}` | undefined)
  );

  // Calculate available balance
  const availableBalance = fromWei(balance);

  const handleSubmit = async (data: StakingFormSubmitData) => {
    if (!address) {
      showErrorToast(
        "Wallet Not Connected",
        "Please connect your wallet to stake tokens."
      );
      return;
    }

    // Convert amount from token units to wei (18 decimals) using parseUnits for precision
    const amountInWei = parseUnits(data.amount.toString(), 18);

    try {
      const approvalTx = await writeContract.mutateAsync({
        address: IDOS_TOKEN_ABI_ADDRESS,
        abi: IDOS_TOKEN_ABI,
        functionName: "approve",
        args: [IDOS_NODE_STAKING_ABI_ADDRESS, amountInWei],
      });

      await waitForTransactionReceipt(config, {
        hash: approvalTx,
      });

      const stakeTx = await writeContract.mutateAsync({
        address: IDOS_NODE_STAKING_ABI_ADDRESS,
        abi: IDOS_NODE_STAKING_ABI,
        functionName: "stake",
        args: [address as `0x${string}`, data.provider.address, amountInWei],
      });

      await waitForTransactionReceipt(config, {
        hash: stakeTx,
      });

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
        "Staking Successful",
        "Your tokens have been staked successfully"
      );
    } catch (error) {
      console.error(error);
      // Try both ABIs since errors can come from token contract (ERC20) or staking contract
      const decodedError = decodeTransactionError(error, [
        IDOS_TOKEN_ABI,
        IDOS_NODE_STAKING_ABI,
      ]);
      showErrorToast("Staking Failed", decodedError.message);
      return;
    }
  };

  return (
    <StakingForm
      balance={availableBalance}
      isBalanceLoading={isBalanceLoading}
      mode="stake"
      onAmountChange={onAmountChange}
      onProviderChange={setSelectedProvider}
      onSubmit={handleSubmit}
      pending={writeContract.isPending}
      selectedProvider={selectedProvider}
    />
  );
}
