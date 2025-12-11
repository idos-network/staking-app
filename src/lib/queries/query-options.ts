import type { Config } from "wagmi";
import { readContractQueryOptions } from "wagmi/query";
import {
  IDOS_NODE_STAKING_ABI,
  IDOS_NODE_STAKING_ABI_ADDRESS,
  IDOS_TOKEN_ABI,
  IDOS_TOKEN_ABI_ADDRESS,
} from "@/lib/abi";

/**
 * Contract parameters for fetching token balance
 */
export function balanceOfParams(address: `0x${string}` | undefined) {
  return {
    address: IDOS_TOKEN_ABI_ADDRESS as `0x${string}`,
    abi: IDOS_TOKEN_ABI,
    functionName: "balanceOf" as const,
    args: address ? ([address] as const) : undefined,
  };
}

/**
 * Query options for fetching token balance (for use with queryClient)
 */
export function balanceOfQueryOptions(
  config: Config,
  address: `0x${string}` | undefined
) {
  return readContractQueryOptions(config, balanceOfParams(address));
}

/**
 * Contract parameters for fetching user stake (active + slashed)
 */
export function getUserStakeParams(address: `0x${string}` | undefined) {
  return {
    address: IDOS_NODE_STAKING_ABI_ADDRESS as `0x${string}`,
    abi: IDOS_NODE_STAKING_ABI,
    functionName: "getUserStake" as const,
    args: address ? ([address] as const) : undefined,
  };
}

/**
 * Query options for fetching user stake (for use with queryClient)
 */
export function getUserStakeQueryOptions(
  config: Config,
  address: `0x${string}` | undefined
) {
  return readContractQueryOptions(config, getUserStakeParams(address));
}

/**
 * Contract parameters for fetching withdrawable reward
 */
export function withdrawableRewardParams(address: `0x${string}` | undefined) {
  return {
    address: IDOS_NODE_STAKING_ABI_ADDRESS as `0x${string}`,
    abi: IDOS_NODE_STAKING_ABI,
    functionName: "withdrawableReward" as const,
    args: address ? ([address] as const) : undefined,
  };
}

/**
 * Query options for fetching withdrawable reward (for use with queryClient)
 */
export function withdrawableRewardQueryOptions(
  config: Config,
  address: `0x${string}` | undefined
) {
  return readContractQueryOptions(config, withdrawableRewardParams(address));
}

/**
 * Contract parameters for fetching UNSTAKE_DELAY constant
 */
export function unstakeDelayParams() {
  return {
    address: IDOS_NODE_STAKING_ABI_ADDRESS as `0x${string}`,
    abi: IDOS_NODE_STAKING_ABI,
    functionName: "UNSTAKE_DELAY" as const,
    args: [] as const,
  };
}

/**
 * Query options for fetching UNSTAKE_DELAY (for use with queryClient)
 */
export function unstakeDelayQueryOptions(config: Config) {
  return readContractQueryOptions(config, unstakeDelayParams());
}

/**
 * Contract parameters for fetching unstake record at a specific index
 */
export function unstakeByUserAtIndexParams(
  address: `0x${string}` | undefined,
  index: number
) {
  return {
    address: IDOS_NODE_STAKING_ABI_ADDRESS as `0x${string}`,
    abi: IDOS_NODE_STAKING_ABI,
    functionName: "unstakesByUser" as const,
    args: address ? ([address, BigInt(index)] as const) : undefined,
  };
}

/**
 * Query options for fetching unstake record at a specific index (for use with queryClient)
 */
export function unstakeByUserAtIndexQueryOptions(
  config: Config,
  address: `0x${string}` | undefined,
  index: number
) {
  const params = unstakeByUserAtIndexParams(address, index);
  const baseOptions = readContractQueryOptions(config, params);

  // Override query key to use serializable format (number instead of BigInt)
  // This prevents BigInt serialization errors in React Query
  return {
    ...baseOptions,
    queryKey: [
      "readContract",
      {
        ...params,
        // Use number in query key for serialization, BigInt is only in actual args
        args: params.args ? [params.args[0], index] : undefined,
      },
    ] as typeof baseOptions.queryKey,
  };
}

/**
 * Contract parameters for fetching stake amount by node and user
 */
export function stakeByNodeByUserParams(
  userAddress: `0x${string}` | undefined,
  nodeAddress: `0x${string}` | undefined
) {
  return {
    address: IDOS_NODE_STAKING_ABI_ADDRESS as `0x${string}`,
    abi: IDOS_NODE_STAKING_ABI,
    functionName: "stakeByNodeByUser" as const,
    args:
      userAddress && nodeAddress
        ? ([userAddress, nodeAddress] as const)
        : undefined,
  };
}

/**
 * Query options for fetching stake amount by node and user (for use with queryClient)
 */
export function stakeByNodeByUserQueryOptions(
  config: Config,
  userAddress: `0x${string}` | undefined,
  nodeAddress: `0x${string}` | undefined
) {
  return readContractQueryOptions(
    config,
    stakeByNodeByUserParams(userAddress, nodeAddress)
  );
}
