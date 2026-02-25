import { CalendarDays, ExternalLink, Lock } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { APP_BLOCK_EXPLORER_URL } from "@/lib/abi";
import {
  formatEthereumAddress,
  formatTokenAmount,
  fromWei,
} from "@/lib/format";
import type { VestingData } from "@/lib/queries/use-vesting";

function formatTimestamp(unixSeconds: bigint): string {
  return new Date(Number(unixSeconds) * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function durationToMonths(seconds: bigint): number {
  return Math.round(Number(seconds) / (30 * 24 * 60 * 60));
}

export function VestingDetails({ data }: { data: VestingData }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="font-semibold">Vesting Schedule</p>
      <div className="flex flex-col gap-3 rounded-xl bg-secondary px-4 py-4">
        <div className="grid grid-cols-2 gap-y-3 text-sm">
          <div className="flex flex-col gap-1">
            <p className="text-muted-foreground text-sm">Vesting Start</p>
            <div className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-muted-foreground" />
              <span>{formatTimestamp(data.start)}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 text-right">
            <p className="text-muted-foreground text-sm">Cliff Date</p>
            <p>{formatTimestamp(data.cliff)}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-muted-foreground text-sm">Vesting End</p>
            <div className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-muted-foreground" />
              <span>{formatTimestamp(data.end)}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 text-right">
            <p className="text-muted-foreground text-sm">Vesting Type</p>
            <p>Linear (post-cliff)</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-muted-foreground text-sm">Duration</p>
            <p>{durationToMonths(data.duration)} months</p>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">Vesting Contract</p>
          <a
            className="flex items-center gap-1 font-mono text-muted-foreground text-sm transition-colors hover:text-foreground"
            href={`${APP_BLOCK_EXPLORER_URL}/address/${data.contractAddress}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            {formatEthereumAddress(data.contractAddress)}
            <ExternalLink className="size-3" />
          </a>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl bg-secondary px-4 py-3">
        <Lock className="size-4 shrink-0 text-muted-foreground" />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="text-sm">
            Still locked:{" "}
            <span className="font-medium">
              {formatTokenAmount(fromWei(data.locked))} IDOS
            </span>
          </p>
          <p className="text-muted-foreground text-sm">
            Fully vested by {formatTimestamp(data.end)}
          </p>
        </div>
      </div>
    </div>
  );
}
