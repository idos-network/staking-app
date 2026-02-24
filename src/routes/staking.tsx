import { createFileRoute } from "@tanstack/react-router";
import { Staking } from "@/components/staking/staking";

export const Route = createFileRoute("/staking")({
  component: StakingPage,
});

function StakingPage() {
  return (
    <div className="mx-auto flex w-full min-w-0 max-w-[678px] flex-col gap-10">
      <div className="flex flex-col gap-3">
        <h2 className="text-2xl">IDOS Staking</h2>
        <p className="text-muted-foreground">
          Stake your IDOS tokens to secure the network and receive Staking
          Rewards.
        </p>
      </div>
      <Staking />
    </div>
  );
}
