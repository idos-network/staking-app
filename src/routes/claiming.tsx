import { useAppKitAccount } from "@reown/appkit/react";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { useState } from "react";
import { useConfig, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { ClaimHistory } from "@/components/claiming/claim-history";
import { ConfirmClaimVesting } from "@/components/claiming/confirm-claim-vesting";
import { VestingDetails } from "@/components/claiming/vesting-details";
import { VestingOverview } from "@/components/claiming/vesting-overview";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { VESTING_ABI, VESTING_TOKEN_ADDRESS } from "@/lib/abi";
import { decodeTransactionError } from "@/lib/decode-error";
import { formatTokenAmount, fromWei } from "@/lib/format";
import { useVesting, type VestingData } from "@/lib/queries/use-vesting";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

export const Route = createFileRoute("/claiming")({
  component: RouteComponent,
});

function ClaimingSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <Skeleton className="h-[315px] w-full rounded-[20px]" />
      <Skeleton className="h-[857px] w-full rounded-[20px]" />
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
          The connected wallet does not have an active vesting contract.
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

  const handleClaim = async () => {
    if (!(address && vesting.contractAddress)) {
      return;
    }

    setIsClaiming(true);
    try {
      const tx = await writeContract.mutateAsync({
        address: vesting.contractAddress,
        abi: VESTING_ABI,
        functionName: "release",
        args: [VESTING_TOKEN_ADDRESS],
      });

      await waitForTransactionReceipt(config, { hash: tx });

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

      const claimedAmount = vesting.claimableNow
        ? formatTokenAmount(fromWei(vesting.claimableNow))
        : "0";

      showSuccessToast(
        "Tokens Claimed",
        `Successfully claimed ${claimedAmount} IDOS.`
      );
    } catch (error) {
      console.error(error);
      const decodedError = decodeTransactionError(error, [VESTING_ABI]);
      showErrorToast("Claim Failed", decodedError.message);
    } finally {
      setIsClaiming(false);
    }
  };

  if (vesting.isLoading) {
    return <ClaimingSkeleton />;
  }

  if (!(vesting.hasVesting && vesting.contractAddress)) {
    return <NoVestingFound />;
  }

  const data = vesting as VestingData;

  return (
    <div className="flex flex-col gap-5">
      <VestingOverview data={data} />

      <div className="min-w-0 rounded-[20px] bg-muted p-6">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold">Your Allocation</p>
              <Badge variant="success">Vesting</Badge>
            </div>

            <div className="flex flex-col gap-2 rounded-xl bg-secondary p-6">
              <p className="text-muted-foreground text-sm">
                Available to Claim
              </p>
              <p className="font-semibold text-2xl text-primary">
                {formatTokenAmount(fromWei(data.claimableNow))} IDOS
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <ConfirmClaimVesting
              address={address}
              claimableNow={data.claimableNow}
              isPending={isClaiming}
              onConfirm={handleClaim}
            />
          </div>

          <Separator />
          <VestingDetails data={data} />
          <Separator />
          <ClaimHistory contractAddress={vesting.contractAddress} />
        </div>
      </div>
    </div>
  );
}
