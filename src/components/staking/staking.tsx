import { useAppKitAccount } from "@reown/appkit/react";
import { useState } from "react";
import { useReadContract } from "wagmi";
import { ClaimRewards } from "@/components/staking/claim-rewards";
import { Stake } from "@/components/staking/stake";
import { Unstake } from "@/components/staking/unstake";
import { WithdrawUnstake } from "@/components/staking/withdraw-unstake";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { IDOS_TOKEN_ABI_ADDRESS } from "@/lib/abi";
import { formatCurrency, formatTokenAmount, fromWei } from "@/lib/format";
import {
  balanceOfParams,
  getUserStakeParams,
  withdrawableRewardParams,
} from "@/lib/queries/query-options";
import { useStakingAPY } from "@/lib/queries/use-staking-apy";
import { useTokenPrice } from "@/lib/queries/use-token-price";

type IDOSBalanceProps = {
  value: bigint | undefined;
  isLoading?: boolean;
};

function IDOSBalance({ value, isLoading }: IDOSBalanceProps) {
  if (isLoading) {
    return <Skeleton className="h-6 w-24 bg-muted" />;
  }

  // Format the token amount
  if (!value || value === 0n) {
    return <span>0.00 IDOS</span>;
  }

  const numericValue = fromWei(value);
  const formatted = formatTokenAmount(numericValue);

  return <span>{formatted} IDOS</span>;
}

type USDBalanceProps = {
  value: bigint | undefined;
  tokenPrice: number | null | undefined;
  isLoading?: boolean;
};

function USDBalance({ value, tokenPrice, isLoading }: USDBalanceProps) {
  if (isLoading) {
    return <Skeleton className="h-4 w-20 bg-muted" />;
  }

  // Format the USD amount
  if (!value || value === 0n || !tokenPrice) {
    return <span>$0.00</span>;
  }

  const tokenValue = fromWei(value);
  const usdValue = tokenValue * tokenPrice;
  const formatted = formatCurrency(usdValue);

  return <span>{formatted}</span>;
}

function EstimatedAPR({ stakeAmount }: { stakeAmount?: number | null }) {
  const { apy, totalStakedNum, isLoading } = useStakingAPY(stakeAmount);
  const hasStakers = totalStakedNum > 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">Estimated APR*</p>
        {isLoading ? (
          <Skeleton className="h-6 w-20 bg-muted" />
        ) : (
          <Badge className="px-3 py-1 text-sm" variant="success">
            {hasStakers ? `${apy.toFixed(2)}%` : "———"}
          </Badge>
        )}
      </div>
      <p className="text-muted-foreground text-sm">
        Staking rewards are accrued daily.
      </p>
      <p className="text-muted-foreground text-sm italic">
        *Estimated only. Not guaranteed and subject to change.
      </p>
    </div>
  );
}

function StakingBalances({
  showAPR = true,
  stakeAmount,
}: {
  showAPR?: boolean;
  stakeAmount?: number | null;
}) {
  const { address } = useAppKitAccount();

  const { data: tokenPrice } = useTokenPrice(IDOS_TOKEN_ABI_ADDRESS);

  const { data: balance, isLoading: isBalanceLoading } = useReadContract(
    balanceOfParams(address as `0x${string}` | undefined)
  );

  const { data: userStake, isLoading: isUserStakeLoading } = useReadContract(
    getUserStakeParams(address as `0x${string}` | undefined)
  );

  const { data: withdrawableReward, isLoading: isRewardLoading } =
    useReadContract(
      withdrawableRewardParams(address as `0x${string}` | undefined)
    );

  // Calculate total staked: activeStake + slashedStake
  // Note: If you want to exclude slashed stake from the total, change this to only use `userStake[0]`
  const totalStaked =
    userStake && Array.isArray(userStake) && userStake.length >= 2
      ? BigInt(userStake[0]) + BigInt(userStake[1])
      : undefined;

  // Extract withdrawableAmount from withdrawableReward result
  // withdrawableReward returns: [withdrawableAmount, rewardAcc, userStakeAcc, totalStakeAcc]
  const totalRewards =
    withdrawableReward &&
    Array.isArray(withdrawableReward) &&
    withdrawableReward.length >= 1
      ? BigInt(withdrawableReward[0])
      : undefined;

  return (
    <div className="w-full rounded-[20px] bg-muted p-6">
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-5">
          <div className="flex w-1/2 flex-col gap-2">
            <p className="text-muted-foreground text-sm">Available Balance</p>
            <div className="flex h-14 flex-col gap-2">
              <div className="text-lg">
                <IDOSBalance isLoading={isBalanceLoading} value={balance} />
              </div>
              <div className="text-muted-foreground text-sm">
                <USDBalance
                  isLoading={isBalanceLoading}
                  tokenPrice={tokenPrice}
                  value={balance}
                />
              </div>
            </div>
          </div>
          <div className="flex w-1/2 flex-col gap-2 text-right">
            <p className="text-muted-foreground text-sm">Total Staked</p>
            <div className="flex h-14 flex-col items-end gap-2">
              <div className="text-lg">
                <IDOSBalance
                  isLoading={isUserStakeLoading}
                  value={totalStaked}
                />
              </div>
              <div className="text-muted-foreground text-sm">
                <USDBalance
                  isLoading={isUserStakeLoading}
                  tokenPrice={tokenPrice}
                  value={totalStaked}
                />
              </div>
            </div>
          </div>
        </div>
        <Separator className="bg-neutral-700" orientation="horizontal" />
        <div className="flex items-center gap-5">
          <div className="flex w-1/2 flex-col gap-2">
            <p className="text-muted-foreground text-sm">Total Rewards</p>
            <div className="flex h-14 flex-col gap-2">
              <div className="text-lg">
                <IDOSBalance isLoading={isRewardLoading} value={totalRewards} />
              </div>
              <div className="text-muted-foreground text-sm">
                <USDBalance
                  isLoading={isRewardLoading}
                  tokenPrice={tokenPrice}
                  value={totalRewards}
                />
              </div>
            </div>
          </div>
          <div className="flex w-1/2 flex-col gap-2 text-right">
            <p className="text-muted-foreground text-sm">
              Est. Monthly Rewards*
            </p>
            <div className="flex flex-col items-end gap-2">
              <p className="text-lg">0.00 IDOS</p>
              <p className="text-muted-foreground text-sm">$0.00</p>
            </div>
          </div>
        </div>
        {showAPR ? (
          <>
            <Separator className="bg-neutral-700" orientation="horizontal" />
            <EstimatedAPR stakeAmount={stakeAmount} />
          </>
        ) : null}
      </div>
    </div>
  );
}

export function Staking() {
  const [activeTab, setActiveTab] = useState("stake");
  const [stakeAmount, setStakeAmount] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-5">
      <StakingBalances
        showAPR={activeTab === "stake"}
        stakeAmount={stakeAmount}
      />
      <Alert variant="warning">
        <AlertDescription className="text-accent-foreground">
          <p>
            Staking carries significant risk, including the potential total loss
            of all staked tokens. Staking rewards are not guaranteed and may be
            reduced or forfeited. Lock-up and unbonding periods may apply. Not
            financial, investment, or legal advice. You are solely responsible
            for your participation.{" "}
            <a
              className="font-medium text-primary underline transition-colors hover:text-primary/80"
              href="http://www.idos.network/legal/portal-terms"
              rel="noopener noreferrer"
              target="_blank"
            >
              Terms apply
            </a>
            .
          </p>
        </AlertDescription>
      </Alert>
      <div className="min-w-0 rounded-[20px] bg-muted p-6">
        <Tabs
          className="gap-10"
          defaultValue="stake"
          onValueChange={setActiveTab}
        >
          <div className="scrollbar-hide min-w-0 overflow-x-auto rounded-full [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <TabsList className="h-11 w-fit min-w-full flex-nowrap rounded-full p-1 [&>*]:shrink-0 [&>*]:whitespace-nowrap [&_[data-slot=tab-indicator]]:rounded-full [&_[data-slot=tab-indicator]]:bg-neutral-950">
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
                value="withdraw-unstake"
              >
                Withdraw Unstake
              </TabsTab>
              <TabsTab
                className="h-full rounded-full text-neutral-400 hover:text-neutral-300 data-active:text-white"
                value="claim"
              >
                Claim Rewards
              </TabsTab>
            </TabsList>
          </div>
          <TabsPanel value="stake">
            <Stake onAmountChange={setStakeAmount} />
          </TabsPanel>
          <TabsPanel value="unstake">
            <Unstake />
          </TabsPanel>
          <TabsPanel value="withdraw-unstake">
            <WithdrawUnstake />
          </TabsPanel>
          <TabsPanel value="claim">
            <ClaimRewards />
          </TabsPanel>
        </Tabs>
      </div>
    </div>
  );
}
