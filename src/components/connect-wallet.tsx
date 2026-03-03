import { useAppKit } from "@reown/appkit/react";
import { useState } from "react";
import idOSLogo from "@/assets/idOS-logo.svg?url";
import { Button } from "@/components/ui/button";

const TC_VERSION = "1.0";
const TC_STORAGE_KEY = "idos:tc-consent";

type ConsentRecord = {
  acceptedAt: number;
  ip: string | null;
  version: string;
};

function getConsent(): ConsentRecord | null {
  try {
    const raw = localStorage.getItem(TC_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as ConsentRecord;
  } catch {
    return null;
  }
}

function saveConsent(): void {
  const record: ConsentRecord = {
    acceptedAt: Date.now(),
    // TODO: capture IP server-side
    ip: null,
    version: TC_VERSION,
  };
  localStorage.setItem(TC_STORAGE_KEY, JSON.stringify(record));
}

function hasValidConsent(): boolean {
  const consent = getConsent();
  return consent !== null && consent.version === TC_VERSION;
}

function ConsentScreen({ onAccept }: { onAccept: () => void }) {
  return (
    <div className="flex h-svh flex-col place-content-center items-center p-5">
      <div className="flex w-full max-w-lg flex-col items-center gap-6">
        <img alt="idOS Logo" height={32} src={idOSLogo} width={100} />
        <h2 className="font-semibold text-2xl">Welcome to idOS Portal</h2>
        <p className="text-center text-muted-foreground text-sm">
          By continuing you agree to the{" "}
          {/* TODO: replace placeholder URLs with actual links */}
          <a
            className="text-primary underline transition-colors hover:text-primary/80"
            href="#terms"
            rel="noopener noreferrer"
            target="_blank"
          >
            Terms of Service
          </a>{" "}
          and confirm you have read our{" "}
          <a
            className="text-primary underline transition-colors hover:text-primary/80"
            href="#privacy"
            rel="noopener noreferrer"
            target="_blank"
          >
            Privacy Policy
          </a>{" "}
          and{" "}
          <a
            className="text-primary underline transition-colors hover:text-primary/80"
            href="#transparency"
            rel="noopener noreferrer"
            target="_blank"
          >
            Transparency Document
          </a>
          .
        </p>
        <Button className="w-full max-w-xs" onClick={onAccept} size="lg">
          Continue
        </Button>
      </div>
    </div>
  );
}

function WalletScreen() {
  const { open } = useAppKit();

  return (
    <div className="flex h-svh flex-col place-content-center items-center p-5">
      <div className="flex w-full max-w-lg flex-col items-center gap-6">
        <img alt="idOS Logo" height={32} src={idOSLogo} width={100} />
        <h2 className="font-semibold text-2xl">Welcome to idOS Portal</h2>
        <p className="text-center text-muted-foreground text-sm">
          Manage your idOS positions — stake tokens to secure the network and
          claim your vested allocation.
        </p>
        <Button
          className="w-full max-w-xs"
          onClick={() => {
            open();
          }}
          size="lg"
        >
          Connect an EVM wallet
        </Button>
      </div>
    </div>
  );
}

export function ConnectWallet() {
  const [consented, setConsented] = useState(hasValidConsent);

  const handleAccept = () => {
    saveConsent();
    setConsented(true);
  };

  if (!consented) {
    return <ConsentScreen onAccept={handleAccept} />;
  }

  return <WalletScreen />;
}
