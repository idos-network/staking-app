import { useAppKitAccount } from "@reown/appkit/react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, ExternalLink, Lock } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { formatEthereumAddress, formatTokenAmount } from "@/lib/format";
import { showSuccessToast } from "@/lib/toast";

export const Route = createFileRoute("/claiming")({
  component: RouteComponent,
});

const _VESTING_ALLOCATIONS: Record<string, number> = {
  "0x6569b018fDd1D47764654A8231376f6185a85d6D": 283_879,
  "0x76b272A6d3f500379DB63c14913fc92246c52d19": 1_892_523,
  "0x0a327a697B801950C71278659F2d105C3E5B9885": 304_400,
  "0x4c67A5A7fe00073F6F9f732F5b62aa00047C6380": 1_522_000,
  "0xE98aCFD7D9aF4d5dc3250c920d108Ca5A36a2646": 11_682_243,
  "0x9A661572C7CFa780326E44621dCcC6bc298E4793": 500_000,
  "0xfC0bEb2772369b834d2C764C0f08E2e99EE6b335": 254_700,
  "0xe1eE8f731787ED8C837755EbD13eaFEd0C2AaA41": 175_000,
  "0x10A8d76Ce2224AE0b3E1fd85eFE9D6f9306391F1": 160_000,
  "0xdf24F4Ca9984807577d13f5ef24eD26e5AFc7083": 50_000,
  "0x4e070B8c883954DBd36e86433989ABe1016398c5": 80_000,
  "0xA33916c552e5C2c0c7eeC006541994F0c320b196": 40_000,
  "0xBe750bB45088F9f784178014211D3843F5Df9579": 80_000,
  "0x0E76638c60bC91aF9B345cb6aDeFce83b81d476E": 20_000,
  "0xaB8990e9B8a73599Cd50cA7786BC1854fe106484": 60_000,
  "0xba2574ceD333788C901B799C84955d548E22ac8e": 120_000,
  "0x329F47e548C0cd687e014eE7A7Dcd5198E971705": 10_000,
  "0x97E27bA55e409D09d467C29953A16284C866304D": 80_000,
  "0x48Fb081aEeDB1a0a6143E716a839b94e927f82bE": 200_000,
  "0x4D428CeCf85667E1Cb90D24D1130683C78Df48B5": 50_000,
  "0x6066A66B6aA460990Fdd857D6F013d8940d7aBa9": 20_000,
  "0x75Eff561053047E06406a4a822260E2cEB605Cce": 50_000,
  "0xBd9aeE42865F5B1f0a1bb69902F0d7fb7a27524b": 100_000,
  "0x448491096f935d05F8eC9C21efbbcDb0DE12d83C": 150_000,
  "0x43c26DFa982E77445325f81D4F1b57a0599fd9F5": 160_000,
  "0xd6f620608146faD03d2e4a20436d6AF4a6742484": 70_000,
  "0xfF6562209E23F730a6A067642DD8aB67610EF281": 150_000,
  "0x28037144F1c545F05FdA267931e8343a807D596D": 60_000,
  "0x665d94996973Bae324302aE3A314403Fb0cc7f45": 70_000,
  "0xf37A9e6Db21FF47201FA93E370B1e58ba66b39a9": 30_000,
  "0x3d8CD50b54a6F6bC66bdc5c74A3BFC848E7762D9": 12_000,
  "0x6711b8CD3e8b4cA1346f362674f8CFeeE777E891": 30_000,
  "0x4394F73143ede4e3A9626137455cd460f7c132D4": 400_000,
  "0xf482d682F85f65F39AF3da83bCE0eFD3Db16c5D7": 120_000,
  "0x79c164b9b05595e900b295bD80031B62ca1c8851": 120_000,
  "0x4A9D51380B88FCd3807A349EdfC5078687D073e5": 120_000,
  "0x2a7858931b509ac9107404f7EE018707326e8039": 50_000,
  "0xe691c8dfE586193aCFD050D70C76531fd719a962": 20_000,
  "0x3149dcFEcdE1eDC0474Eb09B673c94C7D58Ae4da": 50_000,
  "0xF7b0A56033dBCE49Ed20f034DF3b3b5E1e5602E5": 60_000,
  "0x9fB210F3038D133Dab2b5175ce17Fd7ddA0B59EF": 120_000,
};

// ─── Mock vesting data ────────────────────────────────────────────────────────
// Represents a Seed Round investor allocation: 36-month linear vesting with a
// 6-month cliff. In production, replace these constants with on-chain reads
// from the vesting contract.
// ─────────────────────────────────────────────────────────────────────────────

const TOTAL_ALLOCATION: number = 825_000;
const ALREADY_CLAIMED: number = 330_000;
const CLAIMABLE_NOW: number = 220_000;
const TOTAL_VESTED: number = ALREADY_CLAIMED + CLAIMABLE_NOW; // 550,000
const LOCKED: number = TOTAL_ALLOCATION - TOTAL_VESTED; // 275,000

const VESTING_CONFIG = {
  category: "Seed Round",
  type: "Linear (post-cliff)",
  start: new Date("2024-01-01"),
  cliff: new Date("2024-07-01"),
  end: new Date("2027-01-01"),
  vestingMonths: 30,
  contractAddress: "0x742d35Cc6634C0532925a3b8D4C9E2F4b89a6C3e",
};

const CLAIM_HISTORY: Array<{
  date: Date;
  amount: number;
  txHash: string;
}> = [
  {
    date: new Date("2024-07-15"),
    amount: 110_000,
    txHash: "0x1a2b3c4d5e6f7890ab1c2d3e4f5a6b7c8d9e0f1a",
  },
  {
    date: new Date("2024-10-02"),
    amount: 110_000,
    txHash: "0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f",
  },
  {
    date: new Date("2025-01-10"),
    amount: 55_000,
    txHash: "0x9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d",
  },
  {
    date: new Date("2025-04-20"),
    amount: 55_000,
    txHash: "0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
  },
];

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function shortenHash(hash: string): string {
  return `${hash.slice(0, 10)}...${hash.slice(-4)}`;
}

function VestingOverview() {
  const claimedPct = (ALREADY_CLAIMED / TOTAL_ALLOCATION) * 100;
  const claimablePct = (CLAIMABLE_NOW / TOTAL_ALLOCATION) * 100;
  const lockedPct = (LOCKED / TOTAL_ALLOCATION) * 100;
  const totalVestedPct = ((TOTAL_VESTED / TOTAL_ALLOCATION) * 100).toFixed(1);

  return (
    <div className="w-full rounded-[20px] bg-muted p-6">
      <div className="flex flex-col gap-5">
        {/* Metric grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-6">
          <div className="flex flex-col gap-2">
            <p className="text-muted-foreground text-sm">Total Allocation</p>
            <p className="text-lg">
              {formatTokenAmount(TOTAL_ALLOCATION)} IDOS
            </p>
          </div>

          <div className="flex flex-col gap-2 text-right">
            <p className="text-muted-foreground text-sm">Total Vested</p>
            <div className="flex flex-col items-end gap-1">
              <p className="text-lg">{formatTokenAmount(TOTAL_VESTED)} IDOS</p>
              <p className="text-muted-foreground text-sm">{totalVestedPct}%</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-muted-foreground text-sm">Already Claimed</p>
            <div className="flex flex-col gap-1">
              <p className="text-lg">
                {formatTokenAmount(ALREADY_CLAIMED)} IDOS
              </p>
              <p className="text-muted-foreground text-sm">
                {((ALREADY_CLAIMED / TOTAL_ALLOCATION) * 100).toFixed(0)}% of
                total
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 text-right">
            <p className="text-muted-foreground text-sm">Claimable Now</p>
            <p className="font-semibold text-lg text-primary">
              {formatTokenAmount(CLAIMABLE_NOW)} IDOS
            </p>
          </div>
        </div>

        <Separator className="bg-border" orientation="horizontal" />

        {/* Segmented progress bar */}
        <div className="flex flex-col gap-3">
          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="bg-muted-foreground transition-all duration-700"
              style={{ width: `${claimedPct}%` }}
            />
            <div
              className="bg-primary transition-all duration-700"
              style={{ width: `${claimablePct}%` }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-muted-foreground text-sm">
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-muted-foreground" />
              <span>Claimed ({Math.round(claimedPct)}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-primary" />
              <span>Claimable ({Math.round(claimablePct)}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full border border-border bg-secondary" />
              <span>Locked ({Math.round(lockedPct)}%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type ConfirmClaimVestingProps = {
  onConfirm: () => void;
  isClaiming: boolean;
  address: string | undefined;
};

function ConfirmClaimVesting({
  onConfirm,
  isClaiming,
  address,
}: ConfirmClaimVestingProps) {
  const [agreed, setAgreed] = useState(false);

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            className="w-full sm:w-2xs"
            disabled={CLAIMABLE_NOW === 0 || isClaiming}
            size="lg"
          >
            {isClaiming ? <Spinner className="size-5" /> : "Claim now"}
          </Button>
        }
      />
      <DialogPopup className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Claim Vested Tokens</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-stretch gap-5 p-6">
          <div className="rounded-[20px] bg-secondary px-4 py-2">
            <ul className="flex flex-col gap-2">
              <li className="flex h-8 items-center justify-between gap-2">
                <span className="text-muted-foreground text-sm">Recipient</span>
                <span className="font-mono text-sm">
                  {formatEthereumAddress(address)}
                </span>
              </li>
              <li className="flex h-8 items-center justify-between gap-2">
                <span className="text-muted-foreground text-sm">
                  Amount to Claim
                </span>
                <span>{formatTokenAmount(CLAIMABLE_NOW)} IDOS</span>
              </li>
            </ul>
          </div>
          <p className="text-muted-foreground text-sm">
            You will be asked to sign a transaction to claim your vested tokens.
            Gas fees apply.
          </p>
          <Label className="cursor-pointer items-center">
            <Checkbox
              checked={agreed}
              className="mt-0.5"
              onCheckedChange={(val) => setAgreed(val)}
            />
            <span>
              I agree with the{" "}
              <a
                className="underline transition-colors hover:text-foreground"
                href="https://idos.network"
                rel="noopener noreferrer"
                target="_blank"
              >
                Claim Terms & Conditions
              </a>
            </span>
          </Label>
        </div>
        <DialogFooter className="border-none bg-popover pt-2 pb-6">
          <DialogClose
            render={
              <Button
                className="w-full"
                disabled={!agreed}
                onClick={onConfirm}
                size="lg"
              >
                Confirm Claim
              </Button>
            }
          />
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}

function VestingDetails() {
  return (
    <div className="flex flex-col gap-4">
      <p className="font-semibold">Vesting Schedule</p>
      <div className="flex flex-col gap-3 rounded-xl bg-secondary px-4 py-4">
        <div className="grid grid-cols-2 gap-y-3 text-sm">
          <div className="flex flex-col gap-1">
            <p className="text-muted-foreground text-sm">Vesting Start</p>
            <div className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-muted-foreground" />
              <span>{formatDate(VESTING_CONFIG.start)}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 text-right">
            <p className="text-muted-foreground text-sm">Cliff Date</p>
            <p>{formatDate(VESTING_CONFIG.cliff)}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-muted-foreground text-sm">Vesting End</p>
            <div className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-muted-foreground" />
              <span>{formatDate(VESTING_CONFIG.end)}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 text-right">
            <p className="text-muted-foreground text-sm">Vesting Type</p>
            <p>{VESTING_CONFIG.type}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-muted-foreground text-sm">Duration</p>
            <p>{VESTING_CONFIG.vestingMonths} months</p>
          </div>
        </div>

        <Separator />

        {/* Contract link */}
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">Vesting Contract</p>
          <a
            className="flex items-center gap-1 font-mono text-muted-foreground text-sm transition-colors hover:text-foreground"
            href={`https://etherscan.io/address/${VESTING_CONFIG.contractAddress}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            {formatEthereumAddress(VESTING_CONFIG.contractAddress)}
            <ExternalLink className="size-3" />
          </a>
        </div>
      </div>

      {/* Locked remainder */}
      <div className="flex items-center gap-3 rounded-xl bg-secondary px-4 py-3">
        <Lock className="size-4 shrink-0 text-muted-foreground" />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="text-sm">
            Still locked:{" "}
            <span className="font-medium">
              {formatTokenAmount(LOCKED)} IDOS
            </span>
          </p>
          <p className="text-muted-foreground text-sm">
            Fully vested by {formatDate(VESTING_CONFIG.end)}
          </p>
        </div>
      </div>
    </div>
  );
}

function ClaimHistory() {
  return (
    <div className="flex flex-col gap-4">
      <p className="font-semibold">Claim History</p>
      {CLAIM_HISTORY.length === 0 ? (
        <p className="py-6 text-center text-muted-foreground text-sm">
          No claims yet.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {CLAIM_HISTORY.map((entry) => (
            <div
              className="flex items-center justify-between rounded-xl bg-secondary px-4 py-3"
              key={entry.txHash}
            >
              <div className="flex flex-col gap-0.5">
                <p className="font-medium text-sm">
                  +{formatTokenAmount(entry.amount)} IDOS
                </p>
                <p className="text-muted-foreground text-sm">
                  {formatDate(entry.date)}
                </p>
              </div>
              <a
                className="flex items-center gap-1 font-mono text-muted-foreground text-sm transition-colors hover:text-foreground"
                href={`https://etherscan.io/tx/${entry.txHash}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                {shortenHash(entry.txHash)}
                <ExternalLink className="size-3" />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RouteComponent() {
  const { address } = useAppKitAccount();
  const [isClaiming, setIsClaiming] = useState(false);

  const handleClaim = async () => {
    setIsClaiming(true);
    // Simulate a claim transaction — in production, call the vesting contract
    await new Promise<void>((resolve) => setTimeout(resolve, 2000));
    setIsClaiming(false);
    showSuccessToast(
      "Tokens Claimed",
      `Successfully claimed ${formatTokenAmount(CLAIMABLE_NOW)} IDOS.`
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <VestingOverview />

      <div className="min-w-0 rounded-[20px] bg-muted p-6">
        <div className="flex flex-col gap-8">
          {/* Claim action section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold">Your Allocation</p>
              <Badge variant="success">{VESTING_CONFIG.category}</Badge>
            </div>

            {/* Claimable amount card */}
            <div className="flex flex-col gap-2 rounded-xl bg-secondary p-6">
              <p className="text-muted-foreground text-sm">
                Available to Claim
              </p>
              <p className="font-semibold text-2xl text-primary">
                {formatTokenAmount(CLAIMABLE_NOW)} IDOS
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <ConfirmClaimVesting
              address={address as string | undefined}
              isClaiming={isClaiming}
              onConfirm={handleClaim}
            />
          </div>

          <Separator />
          <VestingDetails />
          <Separator />
          <ClaimHistory />
        </div>
      </div>
    </div>
  );
}
