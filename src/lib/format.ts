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
