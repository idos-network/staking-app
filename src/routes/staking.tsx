import { createFileRoute } from "@tanstack/react-router";

import { Staking } from "@/components/staking/staking";

export const Route = createFileRoute("/staking")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Staking />;
}
