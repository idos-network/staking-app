import { useReadContracts } from "wagmi";
import {
  APP_CHAIN_ID,
  TDE_DISBURSEMENT_ABI,
  TDE_DISBURSEMENT_ADDRESS,
} from "@/lib/abi";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const VESTED_MODALITIES = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export function useVestingContracts(beneficiary: `0x${string}` | undefined) {
  const contracts = beneficiary
    ? VESTED_MODALITIES.map((modality) => ({
        address: TDE_DISBURSEMENT_ADDRESS,
        abi: TDE_DISBURSEMENT_ABI,
        functionName: "vestingContracts" as const,
        args: [beneficiary, modality] as const,
        chainId: APP_CHAIN_ID,
      }))
    : [];

  const { data, isLoading } = useReadContracts({
    contracts,
    query: { enabled: !!beneficiary },
  });

  const contractAddresses: `0x${string}`[] | undefined =
    data && beneficiary
      ? data
          .map((r) => (r.status === "success" ? (r.result as string) : null))
          .filter(
            (addr): addr is `0x${string}` =>
              addr !== null && addr !== ZERO_ADDRESS
          )
      : undefined;

  return { contractAddresses, isLoading };
}
