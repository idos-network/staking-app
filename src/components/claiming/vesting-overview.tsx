import { Separator } from "@/components/ui/separator";
import { formatTokenAmount, fromWei } from "@/lib/format";
import type { VestingData } from "@/lib/queries/use-vesting";

import { VestingProgressBar } from "./vesting-progress-bar";

export function VestingOverview({ contracts }: { contracts: VestingData[] }) {
  const totalAllocation = contracts.reduce(
    (sum, c) => sum + fromWei(c.totalAllocation),
    0,
  );
  const totalVested = contracts.reduce(
    (sum, c) => sum + fromWei(c.totalVested),
    0,
  );
  const alreadyClaimed = contracts.reduce(
    (sum, c) => sum + fromWei(c.alreadyClaimed),
    0,
  );
  const claimableNow = contracts.reduce(
    (sum, c) => sum + fromWei(c.claimableNow),
    0,
  );
  const locked = contracts.reduce((sum, c) => sum + fromWei(c.locked), 0);

  const claimedPct =
    totalAllocation > 0 ? (alreadyClaimed / totalAllocation) * 100 : 0;
  const claimablePct =
    totalAllocation > 0 ? (claimableNow / totalAllocation) * 100 : 0;
  const lockedPct = totalAllocation > 0 ? (locked / totalAllocation) * 100 : 0;
  const totalVestedPct =
    totalAllocation > 0
      ? ((totalVested / totalAllocation) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="w-full rounded-[20px] bg-muted p-6">
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-x-4 gap-y-6">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">Total Allocation</p>
            <p className="text-lg">{formatTokenAmount(totalAllocation)} IDOS</p>
          </div>

          <div className="flex flex-col gap-2 text-right">
            <p className="text-sm text-muted-foreground">Total Vested</p>
            <div className="flex flex-col items-end gap-1">
              <p className="text-lg">{formatTokenAmount(totalVested)} IDOS</p>
              <p className="text-sm text-muted-foreground">{totalVestedPct}%</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">Already Claimed</p>
            <div className="flex flex-col gap-1">
              <p className="text-lg">
                {formatTokenAmount(alreadyClaimed)} IDOS
              </p>
              <p className="text-sm text-muted-foreground">
                {totalAllocation > 0
                  ? ((alreadyClaimed / totalAllocation) * 100).toFixed(0)
                  : 0}
                % of total
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 text-right">
            <p className="text-sm text-muted-foreground">Claimable Now</p>
            <p className="text-lg font-semibold text-primary">
              {formatTokenAmount(claimableNow)} IDOS
            </p>
          </div>
        </div>

        <Separator className="bg-border" orientation="horizontal" />

        <VestingProgressBar
          segments={[
            {
              color: "bg-muted-foreground",
              dotClass: "bg-muted-foreground",
              label: "Claimed",
              percent: claimedPct,
            },
            {
              color: "bg-primary",
              dotClass: "bg-primary",
              label: "Claimable",
              percent: claimablePct,
            },
            {
              color: "bg-secondary",
              dotClass: "border border-border bg-secondary",
              label: "Locked",
              percent: lockedPct,
            },
          ]}
        />
      </div>
    </div>
  );
}
