import { useAppKitAccount } from "@reown/appkit/react";
import type { ReactElement } from "react";
import { useReadContract } from "wagmi";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTokenAmount, fromWei } from "@/lib/format";
import { balanceOfParams } from "@/lib/queries/query-options";

type ConfirmWithdrawUnstakeProps = {
  amount: number;
  trigger: ReactElement<Record<string, unknown>>;
  onConfirm: () => void;
};

export function ConfirmWithdrawUnstake({
  amount,
  trigger,
  onConfirm,
}: ConfirmWithdrawUnstakeProps) {
  const { address } = useAppKitAccount();

  // Fetch balance
  const balanceParams = balanceOfParams(address as `0x${string}`);
  const { data: balance, isFetching: isBalanceFetching } = useReadContract({
    ...balanceParams,
    query: {
      refetchOnMount: "always",
    },
  });

  // Calculate values
  const availableBalance = fromWei(balance);

  return (
    <Dialog>
      <DialogTrigger render={trigger} />
      <DialogPopup className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            Withdraw Unstaked
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-stretch gap-5 p-6">
          <div className="rounded-[20px] bg-secondary px-4 py-2">
            <ul className="flex flex-col gap-2">
              <li className="flex h-8 items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">
                  Available Balance
                </span>
                <span>
                  {isBalanceFetching ? (
                    <Skeleton className="h-4 w-20" />
                  ) : (
                    `${formatTokenAmount(availableBalance)} IDOS`
                  )}
                </span>
              </li>
              <li className="flex h-8 items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">
                  Amount to Withdraw
                </span>
                <span>{formatTokenAmount(amount)} IDOS</span>
              </li>
              <li className="flex h-8 items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">
                  Balance After Withdraw
                </span>
                <span>{formatTokenAmount(availableBalance + amount)} IDOS</span>
              </li>
            </ul>
          </div>
          <p className="text-sm text-muted-foreground">
            You will be asked to sign a transaction for withdrawing your
            unstaked tokens
          </p>
        </div>

        <DialogFooter className="border-none bg-popover pt-2 pb-6">
          <DialogClose
            render={
              <Button className="w-full" onClick={onConfirm} size="lg">
                Confirm
              </Button>
            }
          />
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}
