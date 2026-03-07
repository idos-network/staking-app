import { formatUnits, parseUnits } from "viem";

const TOKEN_DECIMALS = 18;
const TOKEN_AMOUNT_PATTERN = /^\d*(\.\d*)?$/;

/**
 * Formats a number as a decimal with 2 decimal places
 * Used for token amounts (e.g., "1,234.56")
 */
export function formatTokenAmount(value: number): string {
  return Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "decimal",
  }).format(value);
}

/**
 * Formats a token bigint into an exact decimal string for inputs.
 */
export function formatTokenInput(value: bigint | undefined | null): string {
  if (value === undefined || value === null) {
    return "0";
  }

  return formatUnits(value, TOKEN_DECIMALS);
}

/**
 * Formats a number as USD currency
 * Used for USD value display (e.g., "$1,234.56")
 */
export function formatCurrency(value: number): string {
  return Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "currency",
  }).format(value);
}

/**
 * Converts a bigint value from wei (or 18 decimals) to a JavaScript number
 * Used for converting blockchain token amounts to human-readable numbers
 * @param value - The bigint value to convert, or undefined/null
 * @returns The converted number, or 0 if value is undefined/null
 */
export function fromWei(value: bigint | undefined | null): number {
  if (!value) {
    return 0;
  }
  return Number(value) / 10 ** 18;
}

/**
 * Parses a token amount string into base units without going through a JS number.
 */
export function parseTokenAmount(value: string): bigint | null {
  const trimmed = value.trim();
  if (!trimmed || !TOKEN_AMOUNT_PATTERN.test(trimmed)) {
    return null;
  }

  let normalized = trimmed;
  if (normalized.startsWith(".")) {
    normalized = `0${normalized}`;
  }
  if (normalized.endsWith(".")) {
    normalized = normalized.slice(0, -1);
  }
  if (!normalized) {
    return null;
  }

  const fractionalPart = normalized.split(".")[1] ?? "";
  if (fractionalPart.length > TOKEN_DECIMALS) {
    return null;
  }

  try {
    return parseUnits(normalized, TOKEN_DECIMALS);
  } catch {
    return null;
  }
}

/**
 * Formats an address as a shortened string
 * Used for displaying addresses in a compact format (e.g., "0x1234...5678")
 */
export function formatEthereumAddress(
  address: `0x${string}` | string | undefined,
): string {
  if (!address) {
    return "...";
  }

  if (address.length <= 10) {
    return address;
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
