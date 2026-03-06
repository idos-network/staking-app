import { describe, expect, it } from "vitest";

import { formatCountdown } from "@/components/staking/withdraw-unstake";

describe("formatCountdown", () => {
  it("returns 'Ready' when secondsRemaining is 0", () => {
    expect(formatCountdown(0)).toBe("Ready");
  });

  it("returns 'Ready' when secondsRemaining is negative", () => {
    expect(formatCountdown(-100)).toBe("Ready");
  });

  it("shows only seconds for durations under 1 minute", () => {
    expect(formatCountdown(30)).toBe("30s remaining");
    expect(formatCountdown(1)).toBe("1s remaining");
    expect(formatCountdown(59)).toBe("59s remaining");
  });

  it("shows minutes and seconds for durations under 1 hour", () => {
    expect(formatCountdown(90)).toBe("1m 30s remaining");
    expect(formatCountdown(60)).toBe("1m remaining");
    expect(formatCountdown(3599)).toBe("59m 59s remaining");
  });

  it("shows hours and minutes for durations under 1 day", () => {
    expect(formatCountdown(3600)).toBe("1h remaining");
    expect(formatCountdown(3660)).toBe("1h 1m remaining");
    expect(formatCountdown(7200)).toBe("2h remaining");
  });

  it("shows days and hours for durations of 1+ days", () => {
    expect(formatCountdown(86_400)).toBe("1d remaining");
    expect(formatCountdown(90_000)).toBe("1d 1h remaining");
    expect(formatCountdown(172_800)).toBe("2d remaining");
  });

  it("does not show minutes when days are present", () => {
    const oneDayThirtyMinutes = 86_400 + 1800;
    expect(formatCountdown(oneDayThirtyMinutes)).toBe("1d remaining");
  });

  it("shows days and hours together", () => {
    const twoDaysFiveHours = 2 * 86_400 + 5 * 3600;
    expect(formatCountdown(twoDaysFiveHours)).toBe("2d 5h remaining");
  });

  it("handles the 14-day mainnet unstake delay", () => {
    const fourteenDays = 14 * 86_400;
    expect(formatCountdown(fourteenDays)).toBe("14d remaining");
  });

  it("handles typical minute-epoch delays (e.g. 2 minutes)", () => {
    expect(formatCountdown(120)).toBe("2m remaining");
    expect(formatCountdown(135)).toBe("2m 15s remaining");
  });
});
