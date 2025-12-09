import { useAppKitAccount } from "@reown/appkit/react";
import { useQueryClient } from "@tanstack/react-query";
import { CheckIcon } from "lucide-react";
import { useState } from "react";
import { parseUnits } from "viem";
import { useReadContract, useWriteContract } from "wagmi";
import type { NodeProvider } from "@/components/staking/node-provider-selector";
import {
  StakingForm,
  type StakingFormSubmitData,
} from "@/components/staking/staking-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogPopup,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IDOS_NODE_STAKING_ABI,
  IDOS_NODE_STAKING_ABI_ADDRESS,
  IDOS_TOKEN_ABI,
  IDOS_TOKEN_ABI_ADDRESS,
} from "@/lib/abi";
import { formatEthereumAddress, formatTokenAmount } from "@/lib/format";
import { showErrorToast } from "@/lib/toast";

type StakingSuccessDialogProps = {
  open: boolean;
  provider: NodeProvider | null;
  address: `0x${string}`;
  onOpenChange: (open: boolean) => void;
};

function StakingSuccessDialog({
  open,
  provider,
  address,
  onOpenChange,
}: StakingSuccessDialogProps) {
  // Fetch balance
  const { data: balance, isFetching: isBalanceFetching } = useReadContract({
    address: IDOS_TOKEN_ABI_ADDRESS,
    abi: IDOS_TOKEN_ABI,
    functionName: "balanceOf",
    args: [address],
    query: {
      enabled: open,
    },
  });

  // Fetch user stake to get the staked amount
  const { data: userStake, isFetching: isUserStakeFetching } = useReadContract({
    address: IDOS_NODE_STAKING_ABI_ADDRESS,
    abi: IDOS_NODE_STAKING_ABI,
    functionName: "getUserStake",
    args: [address],
    query: {
      enabled: open,
    },
  });

  // Fetch withdrawable reward for total rewards
  const { data: withdrawableReward, isFetching: isRewardFetching } =
    useReadContract({
      address: IDOS_NODE_STAKING_ABI_ADDRESS,
      abi: IDOS_NODE_STAKING_ABI,
      functionName: "withdrawableReward",
      args: [address],
      query: {
        enabled: open,
      },
    });

  // Calculate values
  const availableBalance = balance ? Number(balance) / 10 ** 18 : 0;
  const totalStaked =
    userStake && Array.isArray(userStake) && userStake.length >= 2
      ? Number(BigInt(userStake[0]) + BigInt(userStake[1])) / 10 ** 18
      : 0;
  const totalRewards =
    withdrawableReward &&
    Array.isArray(withdrawableReward) &&
    withdrawableReward.length >= 1
      ? Number(withdrawableReward[0]) / 10 ** 18
      : 0;

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogPopup className="sm:max-w-sm">
        <DialogHeader />
        <div className="flex flex-col items-stretch gap-5 p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="flex size-14 flex-col items-center justify-center gap-2 rounded-full bg-[#92FFDC]">
              <CheckIcon className="size-10 shrink-0 text-primary-foreground" />
            </div>
            <p className="text-xl">Stake Successful!</p>
          </div>
          <div className="rounded-[20px] bg-secondary px-4 py-2">
            <ul className="flex flex-col gap-2">
              <li className="flex h-10 items-center justify-between gap-2">
                <span className="text-muted-foreground text-sm">Address</span>
                <span>{formatEthereumAddress(address)}</span>
              </li>
              <li className="flex h-8 items-center justify-between gap-2">
                <span className="text-muted-foreground text-sm">
                  Node Provider
                </span>
                <span>{provider?.name ?? "Unknown Provider"}</span>
              </li>
              <li className="flex h-8 items-center justify-between gap-2">
                <span className="text-muted-foreground text-sm">
                  Available Balance
                </span>
                <span>
                  {isBalanceFetching ? (
                    <Skeleton className="h-4 w-20" />
                  ) : (
                    `${formatTokenAmount(availableBalance)} IDOS`
                  )}
                </span>
              </li>
              <li className="flex h-8 items-center justify-between gap-2">
                <span className="text-muted-foreground text-sm">
                  Staked Amount
                </span>
                <span>
                  {isUserStakeFetching ? (
                    <Skeleton className="h-4 w-20" />
                  ) : (
                    `${formatTokenAmount(totalStaked)} IDOS`
                  )}
                </span>
              </li>
              <li className="flex h-8 items-center justify-between gap-2">
                <span className="text-muted-foreground text-sm">
                  Total Rewards
                </span>
                <span>
                  {isRewardFetching ? (
                    <Skeleton className="h-4 w-20" />
                  ) : (
                    `${formatTokenAmount(totalRewards)} IDOS`
                  )}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="border-none bg-popover pt-2 pb-6">
          <DialogClose
            render={
              <Button className="w-full" size="lg">
                Confirm
              </Button>
            }
          />
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}

export function Stake() {
  const { address } = useAppKitAccount();
  const writeContract = useWriteContract();
  const queryClient = useQueryClient();
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<NodeProvider | null>(
    null
  );

  const handleSubmit = (data: StakingFormSubmitData) => {
    if (!address) {
      showErrorToast(
        "Wallet Not Connected",
        "Please connect your wallet to stake tokens."
      );
      return;
    }

    // Convert amount from token units to wei (18 decimals) using parseUnits for precision
    const amountInWei = parseUnits(data.amount.toString(), 18);

    // First, approve the staking contract to spend tokens
    writeContract.mutate(
      {
        address: IDOS_TOKEN_ABI_ADDRESS,
        abi: IDOS_TOKEN_ABI,
        functionName: "approve",
        args: [IDOS_NODE_STAKING_ABI_ADDRESS, amountInWei],
      },
      {
        onSuccess: () => {
          // After approval succeeds, stake the tokens
          writeContract.mutate(
            {
              address: IDOS_NODE_STAKING_ABI_ADDRESS,
              abi: IDOS_NODE_STAKING_ABI,
              functionName: "stake",
              args: [
                address as `0x${string}`,
                data.provider.address,
                amountInWei,
              ],
            },
            {
              onSuccess: () => {
                // Mark relevant queries as stale and trigger refetch
                queryClient.invalidateQueries({
                  predicate: (query) => {
                    const queryKey = query.queryKey;
                    // Invalidate queries for token balance and staking contract reads
                    return (
                      Array.isArray(queryKey) &&
                      queryKey.some(
                        (key) =>
                          key === IDOS_TOKEN_ABI_ADDRESS ||
                          key === IDOS_NODE_STAKING_ABI_ADDRESS
                      )
                    );
                  },
                });

                // Refetch all stale queries (non-blocking - dialog will show skeletons)
                queryClient.refetchQueries({ stale: true });

                setSelectedProvider(data.provider);
                setIsSuccessDialogOpen(true);
              },
              onError: () => {
                showErrorToast(
                  "Staking Failed",
                  "An unexpected error occurred. Please try again."
                );
              },
            }
          );
        },
        onError: () => {
          showErrorToast(
            "Approval Failed",
            "An unexpected error occurred. Please try again."
          );
        },
      }
    );
  };

  return (
    <>
      <StakingForm onSubmit={handleSubmit} pending={writeContract.isPending} />
      <StakingSuccessDialog
        address={address as `0x${string}`}
        onOpenChange={setIsSuccessDialogOpen}
        open={isSuccessDialogOpen}
        provider={selectedProvider}
      />
    </>
  );
}
