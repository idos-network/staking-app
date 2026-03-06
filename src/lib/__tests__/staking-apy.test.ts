import { describe, expect, it } from "vitest";

import {
  REWARDS_SCHEDULE,
  calculateAPY,
  getRewardsPerDay,
} from "@/lib/queries/use-staking-apy";

const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;

describe("getRewardsPerDay", () => {
  const startTime = 1_000_000;

  it("returns 82,191.78 during year 0 (start of first phase)", () => {
    const now = startTime + 1;
    expect(getRewardsPerDay(startTime, now)).toBe(82_191.78);
  });

  it("returns 82,191.78 during year 1 (still in first phase)", () => {
    const now = startTime + Number(SECONDS_PER_YEAR);
    expect(getRewardsPerDay(startTime, now)).toBe(82_191.78);
  });

  it("returns 41,095.89 during year 3 (second phase: years 2-5)", () => {
    const now = startTime + 3 * SECONDS_PER_YEAR;
    expect(getRewardsPerDay(startTime, now)).toBe(41_095.89);
  });

  it("returns 20,547.95 during year 7 (third phase: years 6-9)", () => {
    const now = startTime + 7 * SECONDS_PER_YEAR;
    expect(getRewardsPerDay(startTime, now)).toBe(20_547.95);
  });

  it("returns 0 after all phases (year 10+)", () => {
    const totalYears = REWARDS_SCHEDULE.reduce((s, p) => s + p.years, 0);
    const now = startTime + totalYears * SECONDS_PER_YEAR + 1;
    expect(getRewardsPerDay(startTime, now)).toBe(0);
  });

  it("returns first phase reward exactly at the boundary of phase 1 to 2", () => {
    const now = startTime + 2 * SECONDS_PER_YEAR - 1;
    expect(getRewardsPerDay(startTime, now)).toBe(82_191.78);
  });

  it("returns second phase reward exactly at the start of phase 2", () => {
    const now = startTime + 2 * SECONDS_PER_YEAR;
    expect(getRewardsPerDay(startTime, now)).toBe(41_095.89);
  });
});

describe("calculateAPY", () => {
  it("defaults stakeAmount to 100 when not provided", () => {
    const rewardsPerDay = 82_191.78;
    const totalStaked = 300_000_000;
    const expected = ((rewardsPerDay * 365) / (totalStaked + 100)) * 100;
    expect(calculateAPY(rewardsPerDay, totalStaked)).toBeCloseTo(expected, 10);
  });

  it("uses explicit stakeAmount in the denominator", () => {
    const rewardsPerDay = 82_191.78;
    const totalStaked = 300_000_000;
    const stakeAmount = 5000;
    const expected =
      ((rewardsPerDay * 365) / (totalStaked + stakeAmount)) * 100;
    expect(calculateAPY(rewardsPerDay, totalStaked, stakeAmount)).toBeCloseTo(
      expected,
      10,
    );
  });

  it("returns ~10% when 30M yearly rewards and ~300M effective staked", () => {
    const rewardsPerDay = 30_000_000 / 365;
    const totalStaked = 300_000_000 - 100;
    expect(calculateAPY(rewardsPerDay, totalStaked)).toBeCloseTo(10, 3);
  });

  it("decreases APY as stakeAmount increases", () => {
    const rewardsPerDay = 82_191.78;
    const totalStaked = 300_000_000;
    const apySmall = calculateAPY(rewardsPerDay, totalStaked, 100);
    const apyLarge = calculateAPY(rewardsPerDay, totalStaked, 1_000_000);
    expect(apySmall).toBeGreaterThan(apyLarge);
  });

  it("returns 0 when effective total (totalStaked + stakeAmount) is 0", () => {
    expect(calculateAPY(82_191.78, 0, 0)).toBe(0);
  });

  it("returns 0 when effective total is negative", () => {
    expect(calculateAPY(82_191.78, -200, 100)).toBe(0);
  });

  it("returns 0 when rewardsPerDay is 0", () => {
    expect(calculateAPY(0, 300_000_000)).toBe(0);
  });

  it("works when totalStaked is 0 but stakeAmount is positive", () => {
    const rewardsPerDay = 82_191.78;
    const expected = ((rewardsPerDay * 365) / 500) * 100;
    expect(calculateAPY(rewardsPerDay, 0, 500)).toBeCloseTo(expected, 10);
  });
});
