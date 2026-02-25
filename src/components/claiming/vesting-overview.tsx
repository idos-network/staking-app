import { Separator } from "@/components/ui/separator";
import { formatTokenAmount, fromWei } from "@/lib/format";
import type { VestingData } from "@/lib/queries/use-vesting";
import { VestingProgressBar } from "./vesting-progress-bar";

export function VestingOverview({ data }: { data: VestingData }) {
  const totalAllocation = data.totalAllocation;
  const totalVested = fromWei(data.totalVested);
  const alreadyClaimed = fromWei(data.alreadyClaimed);
  const claimableNow = fromWei(data.claimableNow);
  const locked = fromWei(data.locked);

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
            <p className="text-muted-foreground text-sm">Total Allocation</p>
            <p className="text-lg">{formatTokenAmount(totalAllocation)} IDOS</p>
          </div>

          <div className="flex flex-col gap-2 text-right">
            <p className="text-muted-foreground text-sm">Total Vested</p>
            <div className="flex flex-col items-end gap-1">
              <p className="text-lg">{formatTokenAmount(totalVested)} IDOS</p>
              <p className="text-muted-foreground text-sm">{totalVestedPct}%</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-muted-foreground text-sm">Already Claimed</p>
            <div className="flex flex-col gap-1">
              <p className="text-lg">
                {formatTokenAmount(alreadyClaimed)} IDOS
              </p>
              <p className="text-muted-foreground text-sm">
                {totalAllocation > 0
                  ? ((alreadyClaimed / totalAllocation) * 100).toFixed(0)
                  : 0}
                % of total
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 text-right">
            <p className="text-muted-foreground text-sm">Claimable Now</p>
            <p className="font-semibold text-lg text-primary">
              {formatTokenAmount(claimableNow)} IDOS
            </p>
          </div>
        </div>

        <Separator className="bg-border" orientation="horizontal" />

        <VestingProgressBar
          segments={[
            {
              label: "Claimed",
              percent: claimedPct,
              color: "bg-muted-foreground",
              dotClass: "bg-muted-foreground",
            },
            {
              label: "Claimable",
              percent: claimablePct,
              color: "bg-primary",
              dotClass: "bg-primary",
            },
            {
              label: "Locked",
              percent: lockedPct,
              color: "bg-secondary",
              dotClass: "border border-border bg-secondary",
            },
          ]}
        />
      </div>
    </div>
  );
}
