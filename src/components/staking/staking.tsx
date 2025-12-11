import { useAppKitAccount } from "@reown/appkit/react";
import { useReadContract } from "wagmi";
import { ClaimRewards } from "@/components/staking/claim-rewards";
import { Stake } from "@/components/staking/stake";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { IDOS_TOKEN_ABI_ADDRESS } from "@/lib/abi";
import { formatCurrency, formatTokenAmount } from "@/lib/format";
import {
  balanceOfParams,
  getUserStakeParams,
  withdrawableRewardParams,
} from "@/lib/queries/query-options";
import { useTokenPrice } from "@/lib/queries/use-token-price";
import { Unstake } from "./unstake";
import { WithdrawUnstake } from "./withdraw-unstake";

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

  const divisor = 10 ** 18;
  const numericValue = Number(value) / divisor;
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

  const divisor = 10 ** 18;
  const tokenValue = Number(value) / divisor;
  const usdValue = tokenValue * tokenPrice;
  const formatted = formatCurrency(usdValue);

  return <span>{formatted}</span>;
}

function StakingBalances() {
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
              Expected Monthly Rewards
            </p>
            <div className="flex flex-col items-end gap-2">
              <p className="text-lg">0.00 IDOS</p>
              <p className="text-muted-foreground text-sm">$0.00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Staking() {
  return (
    <div className="flex flex-col gap-5">
      <StakingBalances />
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
          <TabsPanel value="stake">
            <Stake />
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
