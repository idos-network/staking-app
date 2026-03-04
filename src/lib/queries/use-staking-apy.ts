import { useReadContract } from "wagmi";
import { fromWei } from "@/lib/format";
import { getNodeStakesParams, startTimeParams } from "./query-options";

const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;

export const REWARDS_SCHEDULE = [
  { years: 2, dailyReward: 82_191.78 },
  { years: 4, dailyReward: 41_095.89 },
  { years: 4, dailyReward: 20_547.95 },
] as const;

export function getRewardsPerDay(
  startTimeSeconds: number,
  nowSeconds: number
): number {
  const elapsed = nowSeconds - startTimeSeconds;
  let cumulative = 0;
  for (const phase of REWARDS_SCHEDULE) {
    cumulative += phase.years * SECONDS_PER_YEAR;
    if (elapsed < cumulative) {
      return phase.dailyReward;
    }
  }
  return 0;
}

const DEFAULT_STAKE_AMOUNT = 100;

export function calculateAPY(
  rewardsPerDay: number,
  totalStaked: number,
  stakeAmount: number = DEFAULT_STAKE_AMOUNT
): number {
  const effectiveTotal = totalStaked + stakeAmount;
  if (effectiveTotal <= 0) {
    return 0;
  }
  return ((rewardsPerDay * 365) / effectiveTotal) * 100;
}

export function useStakingAPY(stakeAmount?: number | null, enabled = true) {
  const { data: startTime, isLoading: isStartTimeLoading } = useReadContract({
    ...startTimeParams(),
    query: { enabled },
  });

  const { data: nodeStakes, isLoading: isNodeStakesLoading } = useReadContract({
    ...getNodeStakesParams(),
    query: { enabled },
  });

  const isLoading = isStartTimeLoading || isNodeStakesLoading;

  let totalStaked = 0n;
  if (Array.isArray(nodeStakes)) {
    for (const entry of nodeStakes) {
      totalStaked += BigInt(entry.stake);
    }
  }

  const rewardsPerDay =
    startTime !== undefined
      ? getRewardsPerDay(Number(startTime), Date.now() / 1000)
      : 0;

  const totalStakedNum = fromWei(totalStaked);
  const amount = stakeAmount ?? DEFAULT_STAKE_AMOUNT;
  const apy = calculateAPY(rewardsPerDay, totalStakedNum, amount);

  return { apy, rewardsPerDay, totalStaked, totalStakedNum, isLoading };
}
