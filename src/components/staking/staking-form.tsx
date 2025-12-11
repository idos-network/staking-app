import { ChevronRightIcon, WalletMinimalIcon } from "lucide-react";
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
  nodeProviders,
} from "@/components/staking/node-provider-selector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
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

type NodeProviderTriggerProps = {
  provider: NodeProvider;
  onClick: () => void;
};

function NodeProviderTrigger({ provider, ...props }: NodeProviderTriggerProps) {
  return (
    <Button
      className="h-14 w-full justify-between rounded-xl px-4 text-xl"
      variant="secondary"
      {...props}
    >
      <span className="flex items-center gap-3">
        <div>{provider.providerIcon}</div>
        <span>{provider.name}</span>
      </span>
      <span className="flex items-center gap-5">
        <Badge size="lg" variant="success">
          {provider.apy}% APY
        </Badge>
        <ChevronRightIcon className="size-6" />
      </span>
    </Button>
  );
}

type StakingFormProps = {
  mode: "stake" | "unstake";
  pending: boolean;
  onSubmit: (data: StakingFormSubmitData) => void;
  balance: number;
  isBalanceLoading: boolean;
  onProviderChange?: (provider: NodeProvider) => void;
};
export function StakingForm({
  mode,
  onSubmit,
  pending,
  balance,
  isBalanceLoading,
  onProviderChange,
}: StakingFormProps) {
  const [stakeAmount, setStakeAmount] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<NodeProvider>(
    nodeProviders[0]
  );
  const [isProviderSelectorOpen, setIsProviderSelectorOpen] = useState(false);

  const handleProviderChange = (provider: NodeProvider) => {
    setSelectedProvider(provider);
    onProviderChange?.(provider);
  };

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
    <form
      className="flex flex-col items-center gap-8"
      id={mode}
      name={mode}
      onSubmit={handleSubmit}
    >
      <NodeProviderSelector
        onOpenChange={setIsProviderSelectorOpen}
        onProviderChange={handleProviderChange}
        open={isProviderSelectorOpen}
        providers={nodeProviders}
        selectedProvider={selectedProvider}
        trigger={
          <NodeProviderTrigger
            onClick={() => {
              setIsProviderSelectorOpen(true);
            }}
            provider={selectedProvider}
          />
        }
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
            className="-top-4 relative order-1 sm:relative sm:order-2 md:top-0"
            isLoading={isBalanceLoading}
            mode={mode}
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

      {mode === "stake" ? (
        <ConfirmStake
          amount={stakeAmount ?? 0}
          provider={selectedProvider}
          trigger={
            <Button
              className="w-full lg:w-2xs"
              disabled={!isValid || pending}
              size="lg"
              type="button"
            >
              {pending ? (
                <Spinner className="size-5" />
              ) : (
                <SubmitButtonText mode={mode} />
              )}
            </Button>
          }
        />
      ) : (
        <ConfirmUnstake
          amount={stakeAmount ?? 0}
          provider={selectedProvider}
          trigger={
            <Button
              className="w-full lg:w-2xs"
              disabled={!isValid || pending}
              size="lg"
              type="button"
            >
              {pending ? (
                <Spinner className="size-5" />
              ) : (
                <SubmitButtonText mode={mode} />
              )}
            </Button>
          }
        />
      )}
    </form>
  );
}
