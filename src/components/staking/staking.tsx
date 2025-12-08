import { ClaimRewards } from "@/components/staking/claim-rewards";
import { StakingForm } from "@/components/staking/staking-form";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";

export function Staking() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-5 md:flex-row lg:items-center">
        <div className="h-42 flex-1 rounded-[20px] bg-green-300 p-6">
          <div className="flex items-center gap-5">
            <div className="flex w-1/2 flex-col gap-5">
              <p className="h-10 text-neutral-950 text-sm">Available Balance</p>
              <div className="flex flex-col gap-2">
                <p className="text-lg text-neutral-950">2.450 IDOS</p>
                <p className="text-neutral-950 text-sm">$7.500</p>
              </div>
            </div>
            <Separator className="bg-neutral-400" orientation="vertical" />
            <div className="flex w-1/2 flex-col gap-5">
              <p className="h-10 text-neutral-950 text-sm">Total Staked</p>
              <div className="flex flex-col gap-2">
                <p className="text-lg text-neutral-950">0 IDOS</p>
                <p className="text-neutral-950 text-sm">$0.00</p>
              </div>
            </div>
          </div>
        </div>
        <div className="h-42 flex-1 rounded-[20px] bg-muted p-6">
          <div className="flex items-center gap-5">
            <div className="flex w-1/2 flex-col gap-5">
              <p className="h-10 text-muted-foreground text-sm">
                Total Rewards
              </p>
              <div className="flex flex-col gap-2">
                <p className="text-lg">0 IDOS</p>
                <p className="text-muted-foreground text-sm">$0.00</p>
              </div>
            </div>
            <Separator className="bg-neutral-700" orientation="vertical" />
            <div className="flex w-1/2 flex-col gap-5">
              <p className="h-10 text-muted-foreground text-sm">
                Expected Monthly Rewards
              </p>
              <div className="flex flex-col gap-2">
                <p className="text-lg">52.08 IDOS</p>
                <p className="text-muted-foreground text-sm">$143.22 </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="rounded-[20px] bg-muted p-6">
        <Tabs className="gap-10" defaultValue="stake">
          <TabsList className="h-11 w-full rounded-full p-1 [&_[data-slot=tab-indicator]]:rounded-full [&_[data-slot=tab-indicator]]:bg-neutral-950">
            <TabsTab
              className="h-full rounded-full text-neutral-400 hover:text-neutral-300 data-active:text-white"
              value="stake"
            >
              Stake
            </TabsTab>
            <TabsTab
              className="h-full rounded-full text-neutral-400 hover:text-neutral-300 data-active:text-white"
              value="unstake"
            >
              Unstake
            </TabsTab>
            <TabsTab
              className="h-full rounded-full text-neutral-400 hover:text-neutral-300 data-active:text-white"
              value="claim"
            >
              Claim Rewards
            </TabsTab>
          </TabsList>
          <TabsPanel value="stake">
            <StakingForm onSubmit={console.log} />
          </TabsPanel>
          <TabsPanel value="unstake">
            <StakingForm mode="unstake" onSubmit={console.log} />
          </TabsPanel>
          <TabsPanel value="claim">
            <ClaimRewards />
          </TabsPanel>
        </Tabs>
      </div>
    </div>
  );
}
