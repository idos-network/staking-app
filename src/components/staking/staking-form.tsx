import { TriangleAlertIcon, WalletMinimalIcon } from "lucide-react";
import { useState } from "react";

import {
  AmountField,
  AmountFieldGroup,
  AmountFieldInput,
} from "@/components/staking/amount-field";
import { ConfirmStake } from "@/components/staking/confirm-stake";
import { ConfirmUnstake } from "@/components/staking/confirm-unstake";
import {
  type NodeProvider,
  NodeProviderSelector,
  useOnChainNodeProviders,
} from "@/components/staking/node-provider-selector";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTokenAmount } from "@/lib/format";

type BalanceDisplayProps = {
  balance: number;
  className?: string;
  isLoading?: boolean;
  mode: "stake" | "unstake";
};
function BalanceDisplay({
  balance,
  className,
  isLoading,
  mode,
}: BalanceDisplayProps) {
  const label = mode === "stake" ? "Available Balance" : "Staked Balance";
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <WalletMinimalIcon className="size-5 text-muted-foreground" />
      {isLoading ? (
        <Skeleton className="h-4 w-32" />
      ) : (
        <span className="text-sm text-muted-foreground">
          <span className="font-semibold">{label}:</span>{" "}
          {formatTokenAmount(balance)} IDOS
        </span>
      )}
    </div>
  );
}

function validateStakeAmount(opts: {
  stakeAmount: number | null;
  balance: number;
  mode: "stake" | "unstake";
  checked: boolean;
  hasOnChainProvider: boolean;
}): { isValid: boolean; errorMessage?: string } {
  const hasStakeAmountError =
    opts.stakeAmount !== null && opts.stakeAmount > opts.balance;
  const hasValidAmount = opts.stakeAmount !== null && opts.stakeAmount > 0;

  if (hasStakeAmountError) {
    return {
      errorMessage: `Amount exceeds available balance of ${formatTokenAmount(opts.balance)} IDOS`,
      isValid: false,
    };
  }

  const isValid =
    opts.hasOnChainProvider &&
    (opts.mode === "stake" ? hasValidAmount && opts.checked : hasValidAmount);

  return { isValid };
}

export type StakingFormSubmitData = {
  amount: number;
  provider: NodeProvider;
  mode: "stake" | "unstake";
};

type ConfirmTransactionProps = {
  mode: "stake" | "unstake";
  amount: number;
  isValid: boolean;
  pending: boolean;
  provider: NodeProvider;
};
function ConfirmTransaction({
  mode,
  amount,
  isValid,
  pending,
  provider,
}: ConfirmTransactionProps) {
  if (mode === "stake") {
    return (
      <ConfirmStake
        amount={amount}
        isValid={isValid}
        pending={pending}
        provider={provider}
      />
    );
  }

  if (mode === "unstake") {
    return (
      <ConfirmUnstake
        amount={amount}
        isValid={isValid}
        pending={pending}
        provider={provider}
      />
    );
  }

  return null;
}

type StakingFormProps = {
  mode: "stake" | "unstake";
  pending: boolean;
  onSubmit: (data: StakingFormSubmitData) => Promise<boolean>;
  onAmountChange?: (amount: number | null) => void;
  balance: number;
  isBalanceLoading: boolean;
  selectedProvider: NodeProvider;
  onProviderChange: (provider: NodeProvider) => void;
};
export function StakingForm({
  mode,
  onSubmit,
  onAmountChange,
  pending,
  balance,
  isBalanceLoading,
  selectedProvider,
  onProviderChange,
}: StakingFormProps) {
  const [stakeAmount, _setStakeAmount] = useState<number | null>(null);
  const { providers: onChainProviders, isLoading: isProvidersLoading } =
    useOnChainNodeProviders();

  const setStakeAmount = (value: number | null) => {
    _setStakeAmount(value);
    onAmountChange?.(value);
  };
  const [checked, setChecked] = useState(false);

  const setMaxAmount = () => {
    setStakeAmount(balance);
  };

  const { isValid, errorMessage } = validateStakeAmount({
    balance,
    checked,
    hasOnChainProvider: onChainProviders.length > 0,
    mode,
    stakeAmount,
  });
  const hasStakeAmountError = errorMessage !== undefined;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const success = await onSubmit({
      amount: stakeAmount ?? 0,
      mode,
      provider: selectedProvider,
    });

    if (success) {
      setStakeAmount(null);
      setChecked(false);
    }
  };

  return (
    <form
      className="flex flex-col items-center gap-8"
      id={mode}
      name={mode}
      onSubmit={handleSubmit}
    >
      <Alert variant="warning">
        <TriangleAlertIcon className="text-warning" />
        <AlertTitle className="font-semibold text-warning">
          14-Day Unbonding Period
        </AlertTitle>
        <AlertDescription className="text-foreground">
          {mode === "stake"
            ? "When you unstake in the future, your tokens will be subject to a 14-day unbonding period. During this time, tokens will not earn rewards and cannot be transferred."
            : "Your tokens will be subject to a 14-day unbonding period. During this time, tokens will not earn rewards and cannot be transferred. You can withdraw them after the unbonding period ends."}
        </AlertDescription>
      </Alert>

      {isProvidersLoading ? (
        <div className="flex w-full flex-col gap-4">
          <Skeleton className="h-[24px] w-32" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      ) : (
        onChainProviders.length > 0 && (
          <NodeProviderSelector
            onProviderChange={onProviderChange}
            providers={onChainProviders}
            selectedProvider={selectedProvider}
          />
        )
      )}

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
            className="relative -top-4 order-1 sm:relative sm:order-2 md:top-0"
            isLoading={isBalanceLoading}
            mode={mode}
          />

          <Label
            className="order-2 text-base font-semibold sm:order-1"
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
            <p className="text-xs text-destructive-foreground">
              {errorMessage}
            </p>
          ) : null}
        </div>
      </AmountField>

      {mode === "stake" ? (
        <Label className="w-full gap-3 text-foreground">
          <Checkbox
            checked={checked}
            className="size-5"
            onCheckedChange={setChecked}
          />
          <span>
            I have read the{" "}
            <a
              className="text-primary underline transition-colors hover:text-primary/80"
              href="http://www.idos.network/legal/risk-disclosure-staking"
              rel="noopener noreferrer"
              target="_blank"
            >
              Risk Disclosure
            </a>{" "}
            and understand the risks of staking
          </span>
        </Label>
      ) : null}

      <ConfirmTransaction
        amount={stakeAmount ?? 0}
        isValid={isValid}
        mode={mode}
        pending={pending}
        provider={selectedProvider}
      />
    </form>
  );
}
