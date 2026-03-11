import { CalendarDays, Info } from "lucide-react";

import { formatTokenAmount, fromWei } from "@/lib/format";
import type { VestingData } from "@/lib/queries/use-vesting";

function formatTimestamp(unixSeconds: bigint): string {
  return new Date(Number(unixSeconds) * 1000).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function durationToMonths(seconds: bigint): number {
  return Math.round(Number(seconds) / (30 * 24 * 60 * 60));
}

function durationToDays(seconds: bigint): number {
  return Math.round(Number(seconds) / (24 * 60 * 60));
}

export function VestingDetails({ data }: { data: VestingData }) {
  const totalMonths = durationToMonths(data.duration);
  const cliffMonths = durationToMonths(data.cliff - data.start);
  const total = fromWei(data.totalAllocation);
  const atCliff = totalMonths > 0 ? (total * cliffMonths) / totalMonths : 0;
  const perMonth = totalMonths > 0 ? total / totalMonths : 0;

  return (
    <div className="rounded-lg bg-muted px-4 py-3">
      <div className="grid grid-cols-2 gap-y-3 text-sm">
        <div className="flex flex-col gap-1">
          <p className="text-xs text-muted-foreground">Vesting Start</p>
          <div className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5 text-muted-foreground" />
            <span>{formatTimestamp(data.start)}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1 text-right">
          <p className="text-xs text-muted-foreground">Cliff Date</p>
          <p>{formatTimestamp(data.cliff)}</p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xs text-muted-foreground">Vesting End</p>
          <div className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5 text-muted-foreground" />
            <span>{formatTimestamp(data.end)}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1 text-right">
          <p className="text-xs text-muted-foreground">Vesting Type</p>
          <p>Unlocks linearly after cliff</p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xs text-muted-foreground">Duration</p>
          <p>
            {durationToDays(data.duration)} days (~{totalMonths} months)
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-xs text-accent-foreground">
        <Info className="size-3.5 shrink-0" />
        <p>
          At cliff,{" "}
          <span className="font-medium text-primary">
            ~{formatTokenAmount(atCliff)} IDOS
          </span>{" "}
          unlocks at once, then{" "}
          <span className="font-medium text-primary">
            ~{formatTokenAmount(perMonth)} IDOS
          </span>{" "}
          per month.
        </p>
      </div>
    </div>
  );
}
