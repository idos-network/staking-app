import { type Abi, decodeErrorResult } from "viem";

// Regex pattern for extracting hex error data from messages
const HEX_PATTERN = /0x[a-fA-F0-9]{10,}/;
const USER_REJECTED_PATTERNS = [
  /user denied/i,
  /user rejected/i,
  /rejected the request/i,
  /request rejected/i,
];

/**
 * Checks if a value is a valid hex error data string
 */
function isValidErrorData(value: unknown): value is `0x${string}` {
  return (
    typeof value === "string" && value.startsWith("0x") && value.length > 10
  );
}

/**
 * Extracts error data from a data object with various possible paths
 */
function extractFromDataObject(
  dataObj: Record<string, unknown>,
): `0x${string}` | undefined {
  const possiblePaths = ["data", "revertData", "error", "errorData"];
  for (const path of possiblePaths) {
    const value = dataObj[path];
    if (isValidErrorData(value)) {
      return value;
    }
    // Check nested objects
    if (typeof value === "object" && value !== null) {
      const nested = value as Record<string, unknown>;
      if (isValidErrorData(nested.data)) {
        return nested.data;
      }
    }
  }
  return;
}

/**
 * Extracts hex error data from a string message
 */
function extractHexFromMessage(msg: string): `0x${string}` | undefined {
  const lowerMessage = msg.toLowerCase();
  const looksLikeRevertData =
    lowerMessage.includes("revert") ||
    lowerMessage.includes("error data") ||
    lowerMessage.includes("returned data");

  if (!looksLikeRevertData) {
    return;
  }

  const hexMatch = msg.match(HEX_PATTERN);
  return hexMatch ? (hexMatch[0] as `0x${string}`) : undefined;
}

function isUserRejectedMessage(message: string): boolean {
  return USER_REJECTED_PATTERNS.some((pattern) => pattern.test(message));
}

function isUserRejectedError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const err = error as {
    code?: number;
    message?: string;
    shortMessage?: string;
  };

  return (
    err.code === 4001 ||
    (typeof err.shortMessage === "string" &&
      isUserRejectedMessage(err.shortMessage)) ||
    (typeof err.message === "string" && isUserRejectedMessage(err.message))
  );
}

/**
 * Formats decoded error arguments for display
 */
function formatErrorArgs(args: readonly unknown[]): string {
  // Import fromWei locally to avoid circular dependencies
  const fromWei = (value: bigint): number => Number(value) / 10 ** 18;

  return args
    .map((arg) => {
      if (typeof arg === "bigint") {
        // Format large numbers nicely
        if (arg > BigInt(10 ** 18)) {
          return `${fromWei(arg).toFixed(2)} tokens`;
        }
        return arg.toString();
      }
      if (typeof arg === "string") {
        // Truncate long addresses for readability
        if (arg.length === 42 && arg.startsWith("0x")) {
          return `${arg.slice(0, 6)}...${arg.slice(-4)}`;
        }
        return arg;
      }
      return String(arg);
    })
    .join(", ");
}

/**
 * Extracts error data from error.data property
 */
function extractFromDataProperty(
  err: Record<string, unknown>,
): `0x${string}` | undefined {
  if (!err.data) {
    return;
  }

  if (isValidErrorData(err.data)) {
    return err.data;
  }

  if (typeof err.data === "object" && err.data !== null) {
    return extractFromDataObject(err.data as Record<string, unknown>);
  }

  return;
}

/**
 * Extracts error data from error messages
 */
function extractFromMessages(
  err: Record<string, unknown>,
): `0x${string}` | undefined {
  if (typeof err.shortMessage === "string") {
    const hex = extractHexFromMessage(err.shortMessage);
    if (hex) {
      return hex;
    }
  }

  if (typeof err.message === "string") {
    const hex = extractHexFromMessage(err.message);
    if (hex) {
      return hex;
    }
  }

  return;
}

/**
 * Recursively extracts error data from nested error structures.
 * Viem errors can be deeply nested with cause chains.
 */
function extractErrorData(error: unknown): `0x${string}` | undefined {
  if (!error || typeof error !== "object") {
    return;
  }

  const err = error as Record<string, unknown>;

  // Direct data properties
  const dataResult = extractFromDataProperty(err);
  if (dataResult) {
    return dataResult;
  }

  // Try cause chain (viem BaseError pattern)
  if (err.cause) {
    const causeData = extractErrorData(err.cause);
    if (causeData) {
      return causeData;
    }
  }

  // Try nested error properties
  if (err.error) {
    const errorData = extractErrorData(err.error);
    if (errorData) {
      return errorData;
    }
  }

  // Try to extract from shortMessage/message
  return extractFromMessages(err);
}

/**
 * Tries to decode error data using a single ABI
 */
function tryDecodeWithABI(
  errorData: `0x${string}`,
  abi: Abi,
): { name: string; message: string } | null {
  try {
    const decoded = decodeErrorResult({
      abi,
      data: errorData,
    });

    let message = decoded.errorName;
    if (decoded.args && decoded.args.length > 0) {
      const argsString = formatErrorArgs(decoded.args);
      message = `${decoded.errorName}(${argsString})`;
    }

    return {
      message,
      name: decoded.errorName,
    };
  } catch {
    return null;
  }
}

/**
 * Tries to decode error data using the provided ABIs
 */
function tryDecodeWithABIs(
  errorData: `0x${string}`,
  abis: Abi[],
): { name: string; message: string } | null {
  for (const abi of abis) {
    const result = tryDecodeWithABI(errorData, abi);
    if (result) {
      return result;
    }
  }
  return null;
}

/**
 * Extracts fallback error message from error object
 */
function extractFallbackError(error: unknown): {
  name: string;
  message: string;
} {
  if (error && typeof error === "object") {
    const err = error as {
      code?: number;
      shortMessage?: string;
      message?: string;
      name?: string;
    };

    if (err.code === 4001) {
      return {
        message: "Transaction cancelled in wallet.",
        name: "UserRejectedRequest",
      };
    }

    // Check for viem/wagmi error messages
    const shortMsg = err.shortMessage;
    if (shortMsg) {
      if (isUserRejectedMessage(shortMsg)) {
        return {
          message: "Transaction cancelled in wallet.",
          name: "UserRejectedRequest",
        };
      }

      const isRevert =
        shortMsg.includes("revert") || shortMsg.includes("execution reverted");
      return {
        message: shortMsg,
        name: isRevert
          ? "TransactionReverted"
          : (err.name ?? "TransactionError"),
      };
    }

    const errMsg = err.message;
    if (errMsg && isUserRejectedMessage(errMsg)) {
      return {
        message: "Transaction cancelled in wallet.",
        name: "UserRejectedRequest",
      };
    }

    if (
      errMsg &&
      (errMsg.includes("revert") || errMsg.includes("execution reverted"))
    ) {
      return {
        message: errMsg,
        name: "TransactionReverted",
      };
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
    };
  }

  // Ultimate fallback
  return {
    message: "Transaction failed with an unknown error",
    name: "UnknownError",
  };
}

/**
 * Decodes a transaction revert error into a human-readable message.
 * Attempts to decode custom errors from the provided ABIs, falls back to generic error messages.
 *
 * @param error - The error object from writeContract or waitForTransactionReceipt
 * @param abis - Array of ABIs to try when decoding (e.g., [tokenABI, stakingABI])
 * @returns Object with error name and formatted message
 */
export function decodeTransactionError(
  error: unknown,
  abis: Abi | Abi[],
): { name: string; message: string } {
  const abiArray = Array.isArray(abis) ? abis : [abis];

  if (isUserRejectedError(error)) {
    return {
      message: "Transaction cancelled in wallet.",
      name: "UserRejectedRequest",
    };
  }

  const errorData = extractErrorData(error);

  // Log error structure for debugging (remove in production if needed)
  if (process.env.NODE_ENV === "development") {
    console.error("Error object:", error);
    console.error("Extracted error data:", errorData);
  }

  // If we have error data, try to decode it with each ABI
  if (errorData) {
    const decoded = tryDecodeWithABIs(errorData, abiArray);
    if (decoded) {
      return decoded;
    }

    // If all ABIs failed, return info about the error selector
    return {
      message: `Transaction reverted with error selector: ${errorData.slice(0, 10)}`,
      name: "Reverted",
    };
  }

  // Fallback: try to extract any error message from the error object
  return extractFallbackError(error);
}
