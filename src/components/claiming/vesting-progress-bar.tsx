type Segment = {
  label: string;
  percent: number;
  color: string;
  dotClass: string;
};

type VestingProgressBarProps = {
  segments: Segment[];
};

export function VestingProgressBar({ segments }: VestingProgressBarProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-secondary">
        {segments.map((segment) => (
          <div
            className={`${segment.color} transition-all duration-700`}
            key={segment.label}
            style={{ width: `${segment.percent}%` }}
          />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
        {segments.map((segment) => (
          <div className="flex items-center gap-1.5" key={segment.label}>
            <div className={`size-2 rounded-full ${segment.dotClass}`} />
            <span>
              {segment.label} (
              {segment.percent > 0 && segment.percent < 1
                ? "<1"
                : Math.round(segment.percent)}
              %)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
