import { Button } from "@/components/ui/button";

export function ClaimRewards() {
  return (
    <div className="flex flex-col items-center gap-10">
      <div className="flex w-full flex-col gap-4">
        <p className="font-semibold">Claim Rewards</p>
        <div className="flex flex-col gap-2 rounded-xl bg-secondary p-6">
          <p className="font-semibold text-lg">30.6 IDOS</p>
          <p className="text-muted-foreground text-sm">2.450 IDOS</p>
        </div>
      </div>
      <Button className="w-2xs" size="lg">
        Claim now
      </Button>
    </div>
  );
}
