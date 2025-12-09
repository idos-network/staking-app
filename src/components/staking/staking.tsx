import { useAppKitAccount } from "@reown/appkit/react";
import { useReadContract } from "wagmi";
import { ClaimRewards } from "@/components/staking/claim-rewards";
import { Stake } from "@/components/staking/stake";
import { StakingForm } from "@/components/staking/staking-form";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { Tooltip, TooltipPopup, TooltipTrigger } from "@/components/ui/tooltip";
import {
  IDOS_NODE_STAKING_ABI,
  IDOS_NODE_STAKING_ABI_ADDRESS,
  IDOS_TOKEN_ABI,
  IDOS_TOKEN_ABI_ADDRESS,
} from "@/lib/abi";
import { useTokenPrice } from "@/lib/use-token-price";

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
  const formatted = Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);

  // Show full value if it's 100 or less, otherwise show first 3 digits
  // e.g., "0.00" -> "0.00 IDOS", "10.00" -> "10.00 IDOS", "1,234.56" -> "123... IDOS"
  if (numericValue <= 100) {
    return <span>{formatted} IDOS</span>;
  }

  const numericDigits = formatted.replace(/[^0-9]/g, "");
  const slice = numericDigits.slice(0, 3);
  const displayValue = `${slice}... IDOS`;
  const fullValue = `${formatted} IDOS`;

  return (
    <Tooltip>
      <TooltipTrigger
        render={<span className="cursor-help">{displayValue}</span>}
      />
      <TooltipPopup>{fullValue}</TooltipPopup>
    </Tooltip>
  );
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
  const formatted = Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(usdValue);

  return <span>{formatted}</span>;
}

export function Staking() {
  const { address } = useAppKitAccount();

  const { data: tokenPrice } = useTokenPrice(IDOS_TOKEN_ABI_ADDRESS);

  const { data: balance, isLoading: isBalanceLoading } = useReadContract({
    address: IDOS_TOKEN_ABI_ADDRESS,
    abi: IDOS_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address as `0x${string}`] : undefined,
  });

  const { data: userStake, isLoading: isUserStakeLoading } = useReadContract({
    address: IDOS_NODE_STAKING_ABI_ADDRESS,
    abi: IDOS_NODE_STAKING_ABI,
    functionName: "getUserStake",
    args: address ? [address as `0x${string}`] : undefined,
  });

  const { data: withdrawableReward, isLoading: isRewardLoading } =
    useReadContract({
      address: IDOS_NODE_STAKING_ABI_ADDRESS,
      abi: IDOS_NODE_STAKING_ABI,
      functionName: "withdrawableReward",
      args: address ? [address as `0x${string}`] : undefined,
    });

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
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-5 md:flex-row lg:items-center">
        <div className="h-42 flex-1 rounded-[20px] bg-green-300 p-6">
          <div className="flex items-center gap-5">
            <div className="flex w-1/2 flex-col gap-5">
              <p className="h-10 text-neutral-950 text-sm">Available Balance</p>
              <div className="flex h-14 flex-col gap-2">
                <p className="text-lg text-neutral-950">
                  <IDOSBalance isLoading={isBalanceLoading} value={balance} />
                </p>
                <p className="text-neutral-950 text-sm">
                  <USDBalance
                    isLoading={isBalanceLoading}
                    tokenPrice={tokenPrice}
                    value={balance}
                  />
                </p>
              </div>
            </div>
            <Separator className="bg-neutral-400" orientation="vertical" />
            <div className="flex w-1/2 flex-col gap-5">
              <p className="h-10 text-neutral-950 text-sm">Total Staked</p>
              <div className="flex h-14 flex-col gap-2">
                <p className="text-lg text-neutral-950">
                  <IDOSBalance
                    isLoading={isUserStakeLoading}
                    value={totalStaked}
                  />
                </p>
                <p className="text-neutral-950 text-sm">
                  <USDBalance
                    isLoading={isUserStakeLoading}
                    tokenPrice={tokenPrice}
                    value={totalStaked}
                  />
                </p>
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
              <div className="flex h-14 flex-col gap-2">
                <p className="text-lg">
                  <IDOSBalance
                    isLoading={isRewardLoading}
                    value={totalRewards}
                  />
                </p>
                <p className="text-muted-foreground text-sm">
                  <USDBalance
                    isLoading={isRewardLoading}
                    tokenPrice={tokenPrice}
                    value={totalRewards}
                  />
                </p>
              </div>
            </div>
            <Separator className="bg-neutral-700" orientation="vertical" />
            <div className="flex w-1/2 flex-col gap-5">
              <p className="h-10 text-muted-foreground text-sm">
                Expected Monthly Rewards
              </p>
              <div className="flex flex-col gap-2">
                <p className="text-lg">0.00 IDOS</p>
                <p className="text-muted-foreground text-sm">$0.00</p>
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
            <Stake />
          </TabsPanel>
          <TabsPanel value="unstake">
            <StakingForm
              mode="unstake"
              onSubmit={console.log}
              pending={false}
            />
          </TabsPanel>
          <TabsPanel value="claim">
            <ClaimRewards />
          </TabsPanel>
        </Tabs>
      </div>
    </div>
  );
}
