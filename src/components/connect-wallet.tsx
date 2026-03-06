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
        <h2 className="text-2xl font-semibold">Welcome to idOS Portal</h2>
        <p className="text-center text-sm text-muted-foreground">
          By continuing you agree to the{" "}
          <a
            className="text-primary underline transition-colors hover:text-primary/80"
            href="http://www.idos.network/legal/portal-terms"
            rel="noopener noreferrer"
            target="_blank"
          >
            Terms of Service
          </a>{" "}
          and confirm you have read our{" "}
          <a
            className="text-primary underline transition-colors hover:text-primary/80"
            href="https://www.idos.network/legal/privacy-policy"
            rel="noopener noreferrer"
            target="_blank"
          >
            Privacy Policy
          </a>{" "}
          and{" "}
          <a
            className="text-primary underline transition-colors hover:text-primary/80"
            href="https://drive.google.com/file/d/1lzrdgD_dwusE4xsKw_oTUcu8Hq3YU60b/view?usp=sharing"
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
        <h2 className="text-2xl font-semibold">Welcome to idOS Portal</h2>
        <p className="text-center text-sm text-muted-foreground">
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
