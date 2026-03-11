import { describe, expect, it } from "vitest";

import type { VestingData } from "@/lib/queries/use-vesting";

const WEI = 10n ** 18n;
const MONTH = 30n * 24n * 60n * 60n; // 30 days in seconds

// ── Helpers (mirroring the logic used in our components) ──────────────

function fromWei(value: bigint): number {
  return Number(value) / 10 ** 18;
}

function durationToMonths(seconds: bigint): number {
  return Math.round(Number(seconds) / (30 * 24 * 60 * 60));
}

function durationToDays(seconds: bigint): number {
  return Math.round(Number(seconds) / (24 * 60 * 60));
}

/**
 * OZ VestingWallet vesting schedule:
 *   - before cliff: 0
 *   - at/after cliff: totalAllocation * (t - start) / duration
 *   - at/after end: totalAllocation
 */
function ozVestedAmount(
  totalAllocation: bigint,
  start: bigint,
  duration: bigint,
  cliff: bigint,
  timestamp: bigint,
): bigint {
  if (timestamp < cliff) {
    return 0n;
  }
  if (timestamp >= start + duration) {
    return totalAllocation;
  }
  return (totalAllocation * (timestamp - start)) / duration;
}

/** What our AllocationCard shows: "in cliff" vs "vesting" */
function lockedCopyPhase(now: bigint, cliff: bigint): "cliff" | "vesting" {
  return now < cliff ? "cliff" : "vesting";
}

/** What our VestingDetails computes for the explainer note */
function computeUnlockEstimates(data: VestingData) {
  const totalMonths = durationToMonths(data.duration);
  const cliffMonths = durationToMonths(data.cliff - data.start);
  const total = fromWei(data.totalAllocation);
  const atCliff = totalMonths > 0 ? (total * cliffMonths) / totalMonths : 0;
  const perMonth = totalMonths > 0 ? total / totalMonths : 0;
  return { atCliff, perMonth, totalMonths, cliffMonths };
}

// ── Test data factories ──────────────────────────────────────────────

function makeVesting(overrides: Partial<VestingData> = {}): VestingData {
  const start = 1_700_000_000n; // Some base timestamp
  const cliffSeconds = 6n * MONTH;
  const duration = 18n * MONTH;
  const cliff = start + cliffSeconds;
  const end = start + duration;
  const totalAllocation = 100_000n * WEI;

  return {
    contractAddress: "0x1111111111111111111111111111111111111111",
    totalAllocation,
    alreadyClaimed: 0n,
    claimableNow: 0n,
    totalVested: 0n,
    locked: totalAllocation,
    start,
    end,
    cliff,
    duration,
    ...overrides,
  };
}

// ── Tests ────────────────────────────────────────────────────────────

describe("OZ VestingWallet math", () => {
  const data = makeVesting();

  it("returns 0 vested before cliff", () => {
    const beforeCliff = data.start + 5n * MONTH;
    expect(
      ozVestedAmount(
        data.totalAllocation,
        data.start,
        data.duration,
        data.cliff,
        beforeCliff,
      ),
    ).toBe(0n);
  });

  it("vests ~33.3% at the cliff (6 of 18 months)", () => {
    const atCliff = ozVestedAmount(
      data.totalAllocation,
      data.start,
      data.duration,
      data.cliff,
      data.cliff,
    );
    const pct = (Number(atCliff) / Number(data.totalAllocation)) * 100;
    expect(pct).toBeCloseTo(33.33, 1);
  });

  it("vests linearly between cliff and end", () => {
    const midpoint = data.start + 12n * MONTH; // 12 of 18 months
    const vested = ozVestedAmount(
      data.totalAllocation,
      data.start,
      data.duration,
      data.cliff,
      midpoint,
    );
    const pct = (Number(vested) / Number(data.totalAllocation)) * 100;
    expect(pct).toBeCloseTo(66.67, 1);
  });

  it("returns 100% at the end", () => {
    const vested = ozVestedAmount(
      data.totalAllocation,
      data.start,
      data.duration,
      data.cliff,
      data.end,
    );
    expect(vested).toBe(data.totalAllocation);
  });

  it("returns 100% after the end", () => {
    const afterEnd = data.end + 1000n;
    const vested = ozVestedAmount(
      data.totalAllocation,
      data.start,
      data.duration,
      data.cliff,
      afterEnd,
    );
    expect(vested).toBe(data.totalAllocation);
  });
});

describe("locked copy phase (AllocationCard)", () => {
  const data = makeVesting();

  it("shows 'cliff' when now is before cliff timestamp", () => {
    const now = data.start + 3n * MONTH;
    expect(lockedCopyPhase(now, data.cliff)).toBe("cliff");
  });

  it("shows 'vesting' when now is exactly at cliff", () => {
    expect(lockedCopyPhase(data.cliff, data.cliff)).toBe("vesting");
  });

  it("shows 'vesting' when now is past cliff", () => {
    const now = data.cliff + 2n * MONTH;
    expect(lockedCopyPhase(now, data.cliff)).toBe("vesting");
  });

  it("shows 'vesting' when now is past end", () => {
    const now = data.end + 1000n;
    expect(lockedCopyPhase(now, data.cliff)).toBe("vesting");
  });
});

describe("unlock estimates (VestingDetails)", () => {
  it("computes correct monthly rate for 100k over 18 months", () => {
    const data = makeVesting({ totalAllocation: 100_000n * WEI });
    const { perMonth, totalMonths } = computeUnlockEstimates(data);

    expect(totalMonths).toBe(18);
    expect(perMonth).toBeCloseTo(100_000 / 18, 0);
  });

  it("computes correct cliff lump sum for 6-month cliff / 18-month duration", () => {
    const data = makeVesting({ totalAllocation: 100_000n * WEI });
    const { atCliff, cliffMonths, totalMonths } = computeUnlockEstimates(data);

    expect(cliffMonths).toBe(6);
    expect(totalMonths).toBe(18);
    expect(atCliff).toBeCloseTo(100_000 * (6 / 18), 0);
  });

  it("cliff lump sum matches OZ vestedAmount at cliff timestamp", () => {
    const data = makeVesting({ totalAllocation: 250_000n * WEI });
    const { atCliff } = computeUnlockEstimates(data);

    const ozAtCliff = fromWei(
      ozVestedAmount(
        data.totalAllocation,
        data.start,
        data.duration,
        data.cliff,
        data.cliff,
      ),
    );

    expect(atCliff).toBeCloseTo(ozAtCliff, -1);
  });

  it("per-month rate matches OZ vesting between consecutive months", () => {
    const data = makeVesting({ totalAllocation: 100_000n * WEI });
    const { perMonth } = computeUnlockEstimates(data);

    const vestedAtMonth9 = fromWei(
      ozVestedAmount(
        data.totalAllocation,
        data.start,
        data.duration,
        data.cliff,
        data.start + 9n * MONTH,
      ),
    );
    const vestedAtMonth10 = fromWei(
      ozVestedAmount(
        data.totalAllocation,
        data.start,
        data.duration,
        data.cliff,
        data.start + 10n * MONTH,
      ),
    );

    const actualMonthlyDelta = vestedAtMonth10 - vestedAtMonth9;
    expect(actualMonthlyDelta).toBeCloseTo(perMonth, -1);
  });

  it("cliff lump sum + remaining months at perMonth ≈ totalAllocation", () => {
    const data = makeVesting({ totalAllocation: 100_000n * WEI });
    const { atCliff, perMonth, totalMonths, cliffMonths } =
      computeUnlockEstimates(data);
    const postCliffMonths = totalMonths - cliffMonths;
    const reconstructed = atCliff + perMonth * postCliffMonths;

    expect(reconstructed).toBeCloseTo(100_000, -1);
  });
});

describe("date relationships", () => {
  it("end = start + duration", () => {
    const data = makeVesting();
    expect(data.end).toBe(data.start + data.duration);
  });

  it("cliff is between start and end", () => {
    const data = makeVesting();
    expect(data.cliff).toBeGreaterThan(data.start);
    expect(data.cliff).toBeLessThan(data.end);
  });

  it("cliff - start < duration (cliff is shorter than total duration)", () => {
    const data = makeVesting();
    expect(data.cliff - data.start).toBeLessThan(data.duration);
  });

  it("durationToMonths converts correctly", () => {
    expect(durationToMonths(6n * MONTH)).toBe(6);
    expect(durationToMonths(12n * MONTH)).toBe(12);
    expect(durationToMonths(18n * MONTH)).toBe(18);
  });

  it("durationToDays converts correctly", () => {
    expect(durationToDays(6n * MONTH)).toBe(180);
    expect(durationToDays(12n * MONTH)).toBe(360);
    expect(durationToDays(18n * MONTH)).toBe(540);
  });

  it("durationToDays and durationToMonths are consistent (days ≈ months * 30)", () => {
    const data = makeVesting();
    const days = durationToDays(data.duration);
    const months = durationToMonths(data.duration);
    expect(days).toBeCloseTo(months * 30, 0);
  });
});

describe("locked amount computation (use-vesting hook)", () => {
  it("locked = totalAllocation - totalVested", () => {
    const totalAllocation = 100_000n * WEI;
    const totalVested = 33_000n * WEI;
    const locked =
      totalAllocation > totalVested ? totalAllocation - totalVested : 0n;

    expect(locked).toBe(67_000n * WEI);
  });

  it("locked is 0 when fully vested", () => {
    const totalAllocation = 100_000n * WEI;
    const totalVested = totalAllocation;
    const locked =
      totalAllocation > totalVested ? totalAllocation - totalVested : 0n;

    expect(locked).toBe(0n);
  });

  it("locked equals totalAllocation when nothing is vested (in cliff)", () => {
    const totalAllocation = 100_000n * WEI;
    const totalVested = 0n;
    const locked =
      totalAllocation > totalVested ? totalAllocation - totalVested : 0n;

    expect(locked).toBe(totalAllocation);
  });
});
