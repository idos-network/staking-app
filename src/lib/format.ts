/**
 * Formats a number as a decimal with 2 decimal places
 * Used for token amounts (e.g., "1,234.56")
 */
export function formatTokenAmount(value: number): string {
  return Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formats a number as USD currency
 * Used for USD value display (e.g., "$1,234.56")
 */
export function formatCurrency(value: number): string {
  return Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formats an address as a shortened string
 * Used for displaying addresses in a compact format (e.g., "0x1234...5678")
 */
export function formatEthereumAddress(address: string): string {
  if (!address) {
    return "...";
  }

  if (address.length <= 10) {
    return address;
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
