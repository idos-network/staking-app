import type { Config } from "wagmi";
import { readContractQueryOptions } from "wagmi/query";
import {
  IDOS_NODE_STAKING_ABI,
  IDOS_NODE_STAKING_ABI_ADDRESS,
  IDOS_TOKEN_ABI,
  IDOS_TOKEN_ABI_ADDRESS,
} from "./abi";

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
