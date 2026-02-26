import { ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { APP_BLOCK_EXPLORER_URL } from "@/lib/abi";
import { formatTokenAmount, fromWei } from "@/lib/format";
import { useVestingClaimHistory } from "@/lib/queries/use-vesting";

function shortenHash(hash: string): string {
  return `${hash.slice(0, 10)}...${hash.slice(-4)}`;
}

export function ClaimHistory({
  contractAddresses,
}: {
  contractAddresses: `0x${string}`[];
}) {
  const { claimHistory, isLoading } = useVestingClaimHistory(contractAddresses);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <p className="font-semibold">Claim History</p>
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="font-semibold">Claim History</p>
      {claimHistory.length === 0 ? (
        <p className="py-6 text-center text-muted-foreground text-sm">
          No claims yet.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {claimHistory.map((entry) => (
            <div
              className="flex items-center justify-between rounded-xl bg-secondary px-4 py-3"
              key={entry.txHash}
            >
              <div className="flex flex-col gap-0.5">
                <p className="font-medium text-sm">
                  +{formatTokenAmount(fromWei(entry.amount))} IDOS
                </p>
              </div>
              <a
                className="flex items-center gap-1 font-mono text-muted-foreground text-sm transition-colors hover:text-foreground"
                href={`${APP_BLOCK_EXPLORER_URL}/tx/${entry.txHash}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                {shortenHash(entry.txHash)}
                <ExternalLink className="size-3" />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
