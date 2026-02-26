import { useAppKitAccount } from "@reown/appkit/react";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { useState } from "react";
import { useConfig, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { AllocationCard } from "@/components/claiming/allocation-card";
import { ClaimHistory } from "@/components/claiming/claim-history";
import { ConfirmClaimVesting } from "@/components/claiming/confirm-claim-vesting";
import { VestingOverview } from "@/components/claiming/vesting-overview";
import { Skeleton } from "@/components/ui/skeleton";
import { VESTING_ABI, VESTING_TOKEN_ADDRESS } from "@/lib/abi";
import { decodeTransactionError } from "@/lib/decode-error";
import { formatTokenAmount, fromWei } from "@/lib/format";
import { useVesting } from "@/lib/queries/use-vesting";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

export const Route = createFileRoute("/claiming")({
  component: RouteComponent,
});

function ClaimingSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <Skeleton className="h-[315px] w-full rounded-[20px]" />
      <Skeleton className="h-[200px] w-full rounded-[20px]" />
      <Skeleton className="h-[400px] w-full rounded-[20px]" />
    </div>
  );
}

function NoVestingFound() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-[20px] bg-muted p-10">
      <Lock className="size-8 text-muted-foreground" />
      <div className="flex flex-col items-center gap-2">
        <p className="font-semibold text-lg">No Vesting Found</p>
        <p className="text-center text-muted-foreground text-sm">
          The connected wallet does not have any active vesting contracts.
        </p>
      </div>
    </div>
  );
}

function RouteComponent() {
  const { address } = useAppKitAccount();
  const vesting = useVesting(address);
  const writeContract = useWriteContract();
  const queryClient = useQueryClient();
  const config = useConfig();
  const [isClaiming, setIsClaiming] = useState(false);

  const claimableContracts = vesting.contracts.filter(
    (c) => c.claimableNow > 0n
  );

  const totalClaimable = claimableContracts.reduce(
    (sum, c) => sum + c.claimableNow,
    0n
  );

  const handleClaimAll = async () => {
    if (!address || claimableContracts.length === 0) {
      return;
    }

    setIsClaiming(true);
    let claimed = 0;
    let totalClaimed = 0n;

    try {
      for (const contract of claimableContracts) {
        const tx = await writeContract.mutateAsync({
          address: contract.contractAddress,
          abi: VESTING_ABI,
          functionName: "release",
          args: [VESTING_TOKEN_ADDRESS],
        });

        await waitForTransactionReceipt(config, { hash: tx });
        claimed += 1;
        totalClaimed += contract.claimableNow;
      }

      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            Array.isArray(queryKey) &&
            queryKey.length > 0 &&
            (queryKey[0] === "readContract" || queryKey[0] === "readContracts")
          );
        },
      });
      queryClient.refetchQueries({ stale: true });

      showSuccessToast(
        "Tokens Claimed",
        `Successfully claimed ${formatTokenAmount(fromWei(totalClaimed))} IDOS from ${claimed} ${claimed === 1 ? "contract" : "contracts"}.`
      );
    } catch (error) {
      console.error(error);
      const decodedError = decodeTransactionError(error, [VESTING_ABI]);

      if (claimed > 0) {
        showSuccessToast(
          "Partially Claimed",
          `Claimed from ${claimed} of ${claimableContracts.length} contracts before an error occurred.`
        );
      }

      showErrorToast("Claim Failed", decodedError.message);

      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            Array.isArray(queryKey) &&
            queryKey.length > 0 &&
            (queryKey[0] === "readContract" || queryKey[0] === "readContracts")
          );
        },
      });
      queryClient.refetchQueries({ stale: true });
    } finally {
      setIsClaiming(false);
    }
  };

  if (vesting.isLoading) {
    return <ClaimingSkeleton />;
  }

  if (!vesting.hasVesting || vesting.contracts.length === 0) {
    return <NoVestingFound />;
  }

  return (
    <div className="flex flex-col gap-5">
      <VestingOverview contracts={vesting.contracts} />

      <div className="min-w-0 rounded-[20px] bg-muted p-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 rounded-xl bg-secondary p-6">
            <p className="text-muted-foreground text-sm">Available to Claim</p>
            <p className="font-semibold text-2xl text-primary">
              {formatTokenAmount(fromWei(totalClaimable))} IDOS
            </p>
            {claimableContracts.length > 0 && (
              <p className="text-muted-foreground text-sm">
                Across {claimableContracts.length}{" "}
                {claimableContracts.length === 1 ? "contract" : "contracts"}
              </p>
            )}
          </div>

          <div className="flex justify-center">
            <ConfirmClaimVesting
              address={address}
              contractCount={claimableContracts.length}
              isPending={isClaiming}
              onConfirm={handleClaimAll}
              totalClaimable={totalClaimable}
            />
          </div>
        </div>
      </div>

      <div className="min-w-0 rounded-[20px] bg-muted p-6">
        <div className="flex flex-col gap-4">
          <p className="font-semibold">Your Allocations</p>
          {vesting.contracts.map((data) => (
            <AllocationCard data={data} key={data.contractAddress} />
          ))}
        </div>
      </div>

      <div className="min-w-0 rounded-[20px] bg-muted p-6">
        <ClaimHistory contractAddresses={vesting.contractAddresses} />
      </div>
    </div>
  );
}
