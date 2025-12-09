import { useAppKitAccount } from "@reown/appkit/react";
import { WalletMinimalIcon } from "lucide-react";
import { useState } from "react";
import { useReadContract } from "wagmi";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { IDOS_TOKEN_ABI, IDOS_TOKEN_ABI_ADDRESS } from "@/lib/abi";
import {
  AmountField,
  AmountFieldGroup,
  AmountFieldInput,
} from "./amount-field";
import {
  type NodeProvider,
  NodeProviderSelector,
  nodeProviders,
} from "./node-provider-selector";

type BalanceDisplayProps = {
  balance: number;
};
function BalanceDisplay({ balance }: BalanceDisplayProps) {
  return (
    <div className="flex items-center gap-2">
      <WalletMinimalIcon className="size-5 text-muted-foreground" />
      <span className="text-muted-foreground text-sm">
        <span className="font-semibold">Balance:</span>{" "}
        {Intl.NumberFormat("en-US", {
          style: "decimal",
        }).format(balance)}{" "}
        IDOS
      </span>
    </div>
  );
}

type StakingFormProps = {
  mode?: "stake" | "unstake";
  onSubmit: () => void;
};
export function StakingForm({
  mode = "stake",
  onSubmit: _onSubmit,
}: StakingFormProps) {
  const { address } = useAppKitAccount();

  const { data: balanceRaw } = useReadContract({
    address: IDOS_TOKEN_ABI_ADDRESS,
    abi: IDOS_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address as `0x${string}`] : undefined,
  });

  // Convert bigint balance to number (dividing by 10^18 for 18 decimals)
  const balance = balanceRaw ? Number(balanceRaw) / 10 ** 18 : 0;

  const [stakeAmount, setStakeAmount] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [isProviderDialogOpen, setIsProviderDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<NodeProvider>(
    nodeProviders[0]
  );

  const setMaxAmount = () => {
    setStakeAmount(balance);
  };

  const hasStakeAmountError = stakeAmount !== null && stakeAmount > balance;
  const hasValidAmount = stakeAmount !== null && stakeAmount > 0;
  const errorMessage = hasStakeAmountError
    ? `Amount exceeds available balance of ${Intl.NumberFormat("en-US", {
        style: "decimal",
      }).format(balance)} IDOS`
    : undefined;

  const isValid =
    mode === "stake"
      ? hasValidAmount && !hasStakeAmountError && checked
      : hasValidAmount && !hasStakeAmountError;

  return (
    <form className="flex flex-col items-center gap-8">
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
        <div className="flex w-full items-center justify-between gap-5">
          <Label className="font-semibold text-base" htmlFor="amount-to-stake">
            Amount to Stake
          </Label>
          <BalanceDisplay balance={balance} />
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

      <Button className="w-full lg:w-2xs" disabled={!isValid} size="lg">
        {mode === "stake" ? "Stake" : "Unstake"}
      </Button>
    </form>
  );
}
