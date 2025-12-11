import { useAppKitAccount } from "@reown/appkit/react";
import { WalletMinimalIcon } from "lucide-react";
import { useState } from "react";
import { useReadContract } from "wagmi";
import {
  type NodeProvider,
  NodeProviderSelector,
  nodeProviders,
} from "@/components/staking/node-provider-selector";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { formatTokenAmount } from "@/lib/format";
import { balanceOfParams } from "@/lib/queries/query-options";
import {
  AmountField,
  AmountFieldGroup,
  AmountFieldInput,
} from "./amount-field";

type BalanceDisplayProps = {
  balance: number;
  className?: string;
  isLoading?: boolean;
  label?: string;
};
function BalanceDisplay({
  balance,
  className,
  isLoading,
  label = "Balance",
}: BalanceDisplayProps) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <WalletMinimalIcon className="size-5 text-muted-foreground" />
      {isLoading ? (
        <Skeleton className="h-4 w-32" />
      ) : (
        <span className="text-muted-foreground text-sm">
          <span className="font-semibold">{label}:</span>{" "}
          {formatTokenAmount(balance)} IDOS
        </span>
      )}
    </div>
  );
}

function SubmitButtonText({ mode }: { mode: "stake" | "unstake" }) {
  return mode === "stake" ? "Stake" : "Unstake";
}

function calculateBalance(
  providedBalance: number | undefined,
  balanceRaw: bigint | undefined
): number {
  if (providedBalance !== undefined) {
    return providedBalance;
  }
  if (balanceRaw) {
    return Number(balanceRaw) / 10 ** 18;
  }
  return 0;
}

function validateStakeAmount(
  stakeAmount: number | null,
  balance: number,
  mode: "stake" | "unstake",
  checked: boolean
): { isValid: boolean; errorMessage?: string } {
  const hasStakeAmountError = stakeAmount !== null && stakeAmount > balance;
  const hasValidAmount = stakeAmount !== null && stakeAmount > 0;

  if (hasStakeAmountError) {
    return {
      errorMessage: `Amount exceeds available balance of ${formatTokenAmount(balance)} IDOS`,
      isValid: false,
    };
  }

  const isValid = mode === "stake" ? hasValidAmount && checked : hasValidAmount;

  return { isValid };
}

export type StakingFormSubmitData = {
  amount: number;
  provider: NodeProvider;
  mode: "stake" | "unstake";
};

type StakingFormProps = {
  mode?: "stake" | "unstake";
  pending: boolean;
  onSubmit: (data: StakingFormSubmitData) => void;
  balance?: number;
  isBalanceLoading?: boolean;
  balanceLabel?: string;
};
export function StakingForm({
  mode = "stake",
  onSubmit,
  pending,
  balance: providedBalance,
  isBalanceLoading: providedIsBalanceLoading,
  balanceLabel,
}: StakingFormProps) {
  const { address } = useAppKitAccount();

  const { data: balanceRaw, isLoading: isBalanceLoading } = useReadContract(
    balanceOfParams(address as `0x${string}` | undefined)
  );

  const balance = calculateBalance(providedBalance, balanceRaw);
  const isBalanceLoadingState =
    providedIsBalanceLoading !== undefined
      ? providedIsBalanceLoading
      : isBalanceLoading;

  const [stakeAmount, setStakeAmount] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [isProviderDialogOpen, setIsProviderDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<NodeProvider>(
    nodeProviders[0]
  );

  const setMaxAmount = () => {
    setStakeAmount(balance);
  };

  const { isValid, errorMessage } = validateStakeAmount(
    stakeAmount,
    balance,
    mode,
    checked
  );
  const hasStakeAmountError = errorMessage !== undefined;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    onSubmit({
      amount: stakeAmount ?? 0,
      provider: selectedProvider,
      mode,
    });
  };

  return (
    <form className="flex flex-col items-center gap-8" onSubmit={handleSubmit}>
      <NodeProviderSelector
        onOpenChange={setIsProviderDialogOpen}
        onProviderChange={setSelectedProvider}
        open={isProviderDialogOpen}
        providers={nodeProviders}
        selectedProvider={selectedProvider}
      />
      <AmountField
        className="flex flex-col gap-4"
        onValueChange={(value) => {
          setStakeAmount(value ?? null);
        }}
        value={stakeAmount}
      >
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
          <BalanceDisplay
            balance={balance}
            className="order-1 sm:order-2"
            isLoading={isBalanceLoadingState}
            label={balanceLabel}
          />
          <Label
            className="order-2 font-semibold text-base sm:order-1"
            htmlFor="amount-to-stake"
          >
            {mode === "unstake" ? "Amount to Unstake" : "Amount to Stake"}
          </Label>
        </div>
        <div className="flex w-full flex-col gap-2">
          <AmountFieldGroup
            aria-invalid={hasStakeAmountError}
            className="h-[72px] rounded-xl border-transparent bg-secondary pr-6 pl-4"
          >
            <AmountFieldInput
              aria-invalid={hasStakeAmountError}
              className="text-xl"
              id="amount-to-stake"
              placeholder="100.00 IDOS"
            />
            <Button
              className="h-fit w-fit text-success-foreground hover:border-primary"
              onClick={setMaxAmount}
              type="button"
              variant="secondary"
            >
              MAX
            </Button>
          </AmountFieldGroup>

          {hasStakeAmountError ? (
            <p className="text-destructive-foreground text-xs">
              {errorMessage}
            </p>
          ) : null}
        </div>
      </AmountField>

      {mode === "stake" ? (
        <Label className="w-full gap-3 text-muted-foreground">
          <Checkbox
            checked={checked}
            className="size-5"
            onCheckedChange={setChecked}
          />
          I understand that by staking, I'm insuring the protocol and putting my
          capital at risk
        </Label>
      ) : null}

      {mode === "unstake" ? (
        <p className="w-full text-muted-foreground text-sm">
          Unstaking IDOS tokens is subject to an unbonding period of 14 days
        </p>
      ) : null}

      <Button
        className="w-full lg:w-2xs"
        disabled={!isValid || pending}
        size="lg"
        type="submit"
      >
        {pending ? (
          <Spinner className="size-5" />
        ) : (
          <SubmitButtonText mode={mode} />
        )}
      </Button>
    </form>
  );
}
