import { useAppKitAccount } from "@reown/appkit/react";
import { useQueryClient } from "@tanstack/react-query";
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
  IDOS_TOKEN_ABI_ADDRESS,
} from "@/lib/abi";
import { decodeTransactionError } from "@/lib/decode-error";
import { formatTokenInput, fromWei } from "@/lib/format";
import { allowanceParams, balanceOfParams } from "@/lib/queries/query-options";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

export function Stake({
  onAmountChange,
  selectedProvider,
  onProviderChange,
}: {
  onAmountChange?: (amount: number | null) => void;
  selectedProvider: NodeProvider;
  onProviderChange: (provider: NodeProvider) => void;
}) {
  const { address } = useAppKitAccount();
  const writeContract = useWriteContract();
  const queryClient = useQueryClient();

  const config = useConfig();

  // Fetch available balance
  const {
    data: balance,
    isLoading: isBalanceLoading,
    refetch: refetchBalance,
  } = useReadContract(balanceOfParams(address as `0x${string}` | undefined));
  const { refetch: refetchAllowance } = useReadContract(
    allowanceParams(
      address as `0x${string}` | undefined,
      IDOS_NODE_STAKING_ABI_ADDRESS,
    ),
  );

  // Calculate available balance
  const availableBalance = fromWei(balance);

  const handleSubmit = async (
    data: StakingFormSubmitData,
  ): Promise<boolean> => {
    if (!address) {
      showErrorToast(
        "Wallet Not Connected",
        "Please connect your wallet to stake tokens.",
      );
      return false;
    }

    const { amountInWei } = data;

    try {
      const { data: latestBalance } = await refetchBalance();
      const currentBalance = latestBalance ?? 0n;

      if (currentBalance < amountInWei) {
        showErrorToast(
          "Insufficient IDOS Balance",
          `This stake amount exceeds your wallet balance. Current balance: ${formatTokenInput(currentBalance)} IDOS.`,
        );
        return false;
      }

      const { data: allowance } = await refetchAllowance();
      const currentAllowance = allowance ?? 0n;

      if (currentAllowance < amountInWei) {
        const approvalTx = await writeContract.mutateAsync({
          abi: IDOS_TOKEN_ABI,
          address: IDOS_TOKEN_ABI_ADDRESS,
          args: [IDOS_NODE_STAKING_ABI_ADDRESS, amountInWei],
          functionName: "approve",
        });

        await waitForTransactionReceipt(config, {
          hash: approvalTx,
        });
      }

      const stakeTx = await writeContract.mutateAsync({
        abi: IDOS_NODE_STAKING_ABI,
        address: IDOS_NODE_STAKING_ABI_ADDRESS,
        args: [address as `0x${string}`, data.provider.address, amountInWei],
        functionName: "stake",
      });

      await waitForTransactionReceipt(config, {
        hash: stakeTx,
      });

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
        "Staking Successful",
        "Your tokens have been staked successfully",
      );

      return true;
    } catch (error) {
      console.error(error);
      // Try both ABIs since errors can come from token contract (ERC20) or staking contract
      const decodedError = decodeTransactionError(error, [
        IDOS_TOKEN_ABI,
        IDOS_NODE_STAKING_ABI,
      ]);

      if (decodedError.name === "UserRejectedRequest") {
        showErrorToast("Transaction Cancelled", decodedError.message);
        return false;
      }

      if (decodedError.name === "ERC20InsufficientBalance") {
        showErrorToast(
          "Insufficient IDOS Balance",
          "This stake amount exceeds your wallet balance. Reduce the amount slightly and try again.",
        );
        return false;
      }

      showErrorToast("Staking Failed", decodedError.message);
      return false;
    }
  };

  return (
    <StakingForm
      balance={availableBalance}
      balanceRaw={balance}
      isBalanceLoading={isBalanceLoading}
      mode="stake"
      onAmountChange={onAmountChange}
      onProviderChange={onProviderChange}
      onSubmit={handleSubmit}
      pending={writeContract.isPending}
      selectedProvider={selectedProvider}
    />
  );
}
