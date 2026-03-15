import { TriangleAlertIcon, WalletMinimalIcon } from "lucide-react";
import { useState } from "react";

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
import {
  formatTokenAmount,
  formatTokenInput,
  parseTokenAmount,
} from "@/lib/format";

const AMOUNT_INPUT_PATTERN = /^\d*\.?\d*$/;

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
  stakeAmountInWei: bigint | null;
  stakeAmountInput: string;
  balance: number;
  balanceRaw: bigint | undefined;
  mode: "stake" | "unstake";
  checked: boolean;
  hasOnChainProvider: boolean;
}): { isValid: boolean; errorMessage?: string } {
  const hasAmountInput = opts.stakeAmountInput.trim().length > 0;
  const amountInWei = opts.stakeAmountInWei;
  const hasValidAmount = amountInWei !== null && amountInWei > 0n;
  const exceedsBalance =
    hasValidAmount &&
    opts.balanceRaw !== undefined &&
    amountInWei > opts.balanceRaw;

  if (hasAmountInput && opts.stakeAmountInWei === null) {
    return {
      errorMessage: "Enter a valid IDOS amount with up to 18 decimals",
      isValid: false,
    };
  }

  if (exceedsBalance) {
    return {
      errorMessage: `Amount exceeds available balance of ${formatTokenAmount(opts.balance)} IDOS`,
      isValid: false,
    };
  }

  const isValid =
    opts.hasOnChainProvider &&
    opts.balanceRaw !== undefined &&
    (opts.mode === "stake" ? hasValidAmount && opts.checked : hasValidAmount);

  return { isValid };
}

export type StakingFormSubmitData = {
  amount: string;
  amountInWei: bigint;
  provider: NodeProvider;
  mode: "stake" | "unstake";
};

type ConfirmTransactionProps = {
  mode: "stake" | "unstake";
  amount: number;
  amountInWei: bigint;
  isValid: boolean;
  pending: boolean;
  provider: NodeProvider;
};
function ConfirmTransaction({
  mode,
  amount,
  amountInWei,
  isValid,
  pending,
  provider,
}: ConfirmTransactionProps) {
  if (mode === "stake") {
    return (
      <ConfirmStake
        amount={amount}
        amountInWei={amountInWei}
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
  balanceRaw: bigint | undefined;
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
  balanceRaw,
  isBalanceLoading,
  selectedProvider,
  onProviderChange,
}: StakingFormProps) {
  const [stakeAmountInput, _setStakeAmountInput] = useState("");
  const { providers: onChainProviders, isLoading: isProvidersLoading } =
    useOnChainNodeProviders();

  const parsedStakeAmountInWei = parseTokenAmount(stakeAmountInput);
  const parsedStakeAmount =
    parsedStakeAmountInWei === null ? null : Number(stakeAmountInput);
  const stakeAmount =
    parsedStakeAmount !== null && Number.isFinite(parsedStakeAmount)
      ? parsedStakeAmount
      : null;

  const setStakeAmountInput = (value: string) => {
    _setStakeAmountInput(value);

    const parsedValue = parseTokenAmount(value);
    if (parsedValue === null) {
      onAmountChange?.(null);
      return;
    }

    const numericValue = Number(value);
    onAmountChange?.(Number.isFinite(numericValue) ? numericValue : null);
  };
  const [checked, setChecked] = useState(false);

  const setMaxAmount = () => {
    setStakeAmountInput(formatTokenInput(balanceRaw));
  };

  const { isValid, errorMessage } = validateStakeAmount({
    balance,
    balanceRaw,
    checked,
    hasOnChainProvider: onChainProviders.length > 0,
    mode,
    stakeAmountInWei: parsedStakeAmountInWei,
    stakeAmountInput,
  });
  const hasStakeAmountError = errorMessage !== undefined;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValid || parsedStakeAmountInWei === null) {
      return;
    }

    const success = await onSubmit({
      amount: stakeAmountInput,
      amountInWei: parsedStakeAmountInWei,
      mode,
      provider: selectedProvider,
    });

    if (success) {
      setStakeAmountInput("");
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

      <div className="flex w-full flex-col gap-4">
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
          <div
            aria-invalid={hasStakeAmountError}
            className="flex h-[72px] items-center gap-4 rounded-xl border-transparent bg-secondary pr-6 pl-4"
          >
            <input
              aria-invalid={hasStakeAmountError}
              autoComplete="off"
              className="h-full w-full min-w-0 flex-1 bg-transparent py-[calc(--spacing(1.5)-1px)] text-xl tabular-nums outline-none"
              id="amount-to-stake"
              inputMode="decimal"
              onChange={(event) => {
                const value = event.target.value.replaceAll(",", "");
                if (value === "" || AMOUNT_INPUT_PATTERN.test(value)) {
                  setStakeAmountInput(value);
                }
              }}
              placeholder="100.00 IDOS"
              spellCheck={false}
              type="text"
              value={stakeAmountInput}
            />
            <Button
              className="h-fit w-fit text-success-foreground hover:border-primary"
              onClick={setMaxAmount}
              type="button"
              variant="secondary"
            >
              MAX
            </Button>
          </div>

          {hasStakeAmountError ? (
            <p className="text-xs text-destructive-foreground">
              {errorMessage}
            </p>
          ) : null}
        </div>
      </div>

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
              href="https://www.idos.network/legal/risk-disclosure-staking"
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
        amountInWei={parsedStakeAmountInWei ?? 0n}
        isValid={isValid}
        mode={mode}
        pending={pending}
        provider={selectedProvider}
      />
    </form>
  );
}
