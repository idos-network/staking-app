import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchCoinGeckoPrice,
  fetchZerionPrice,
} from "@/lib/queries/use-token-price";

const CONTRACT = "0x68731d6f14b827bbcffbebb62b19daa18de1d79c";
const API_KEY = "test-api-key";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("fetchZerionPrice", () => {
  it("returns price from a valid response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              attributes: {
                market_data: { price: 2.45 },
              },
            },
          }),
      })
    );

    expect(await fetchZerionPrice(CONTRACT, API_KEY)).toBe(2.45);
  });

  it("returns null when API key is empty", async () => {
    expect(await fetchZerionPrice(CONTRACT, "")).toBeNull();
  });

  it("returns null on non-200 response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 401 })
    );

    expect(await fetchZerionPrice(CONTRACT, API_KEY)).toBeNull();
  });

  it("returns null when market_data.price is null", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              attributes: {
                market_data: { price: null },
              },
            },
          }),
      })
    );

    expect(await fetchZerionPrice(CONTRACT, API_KEY)).toBeNull();
  });

  it("throws on network error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network failure"))
    );

    await expect(fetchZerionPrice(CONTRACT, API_KEY)).rejects.toThrow(
      "Network failure"
    );
  });

  it("sends correct Authorization header", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: { attributes: { market_data: { price: 1.0 } } },
        }),
    });
    vi.stubGlobal("fetch", mockFetch);

    await fetchZerionPrice(CONTRACT, API_KEY);

    const [, options] = mockFetch.mock.calls[0];
    const expectedAuth = `Basic ${btoa(`${API_KEY}:`)}`;
    expect(options.headers.Authorization).toBe(expectedAuth);
  });
});

describe("fetchCoinGeckoPrice", () => {
  it("returns price from a valid response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            [CONTRACT]: { usd: 3.12 },
          }),
      })
    );

    expect(await fetchCoinGeckoPrice(CONTRACT, 42_161)).toBe(3.12);
  });

  it("returns null for unsupported chain ID", async () => {
    expect(await fetchCoinGeckoPrice(CONTRACT, 999)).toBeNull();
  });

  it("returns null on non-200 response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 429 })
    );

    expect(await fetchCoinGeckoPrice(CONTRACT, 42_161)).toBeNull();
  });

  it("throws on network error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network failure"))
    );

    await expect(fetchCoinGeckoPrice(CONTRACT, 42_161)).rejects.toThrow(
      "Network failure"
    );
  });

  it("returns null when token is not found in response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

    expect(await fetchCoinGeckoPrice(CONTRACT, 42_161)).toBeNull();
  });
});
