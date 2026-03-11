import { ChevronDown, ExternalLink, Lock } from "lucide-react";

import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { APP_BLOCK_EXPLORER_URL } from "@/lib/abi";
import {
  formatEthereumAddress,
  formatTokenAmount,
  fromWei,
} from "@/lib/format";
import type { VestingData } from "@/lib/queries/use-vesting";

import { VestingDetails } from "./vesting-details";

function formatTimestamp(unixSeconds: bigint): string {
  return new Date(Number(unixSeconds) * 1000).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AllocationCard({ data }: { data: VestingData }) {
  const totalAllocation = fromWei(data.totalAllocation);
  const claimed = fromWei(data.alreadyClaimed);
  const claimable = fromWei(data.claimableNow);
  const locked = fromWei(data.locked);
  const totalVested = fromWei(data.totalVested);

  const claimedPct =
    totalAllocation > 0 ? (claimed / totalAllocation) * 100 : 0;
  const claimablePct =
    totalAllocation > 0 ? (claimable / totalAllocation) * 100 : 0;
  const lockedPct = totalAllocation > 0 ? (locked / totalAllocation) * 100 : 0;
  const vestedPct =
    totalAllocation > 0 ? Math.round((totalVested / totalAllocation) * 100) : 0;

  return (
    <Collapsible className="flex flex-col gap-4 rounded-xl bg-secondary p-4">
      <div className="flex items-center justify-end">
        <a
          className="flex items-center gap-1 font-mono text-sm text-muted-foreground transition-colors hover:text-foreground"
          href={`${APP_BLOCK_EXPLORER_URL}/address/${data.contractAddress}`}
          rel="noopener noreferrer"
          target="_blank"
        >
          {formatEthereumAddress(data.contractAddress)}
          <ExternalLink className="size-3" />
        </a>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col gap-1">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-sm font-medium">
            {formatTokenAmount(totalAllocation)}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xs text-muted-foreground">Claimed</p>
          <p className="text-sm font-medium">{formatTokenAmount(claimed)}</p>
        </div>
        <div className="flex flex-col gap-1 text-right">
          <p className="text-xs text-muted-foreground">Claimable</p>
          <p className="text-sm font-medium text-primary">
            {claimable > 0 ? formatTokenAmount(claimable) : "\u2014"}
          </p>
        </div>
      </div>

      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="bg-muted-foreground transition-all duration-700"
          style={{ width: `${claimedPct}%` }}
        />
        <div
          className="bg-primary transition-all duration-700"
          style={{ width: `${claimablePct}%` }}
        />
        <div
          className="bg-border transition-all duration-700"
          style={{ width: `${lockedPct}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{vestedPct}% vested</span>
        <span className="flex items-center gap-1">
          <Lock className="size-3" />
          {BigInt(Math.floor(Date.now() / 1000)) < data.cliff
            ? `${formatTokenAmount(locked)} in cliff until ${formatTimestamp(data.cliff)}`
            : `${formatTokenAmount(locked)} vesting until ${formatTimestamp(data.end)}`}
        </span>
      </div>

      <CollapsibleTrigger className="group flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-primary/80">
        <span>Vesting Schedule</span>
        <ChevronDown className="size-3.5 transition-transform duration-200 group-aria-expanded:rotate-180" />
      </CollapsibleTrigger>

      <CollapsiblePanel>
        <VestingDetails data={data} />
      </CollapsiblePanel>
    </Collapsible>
  );
}
