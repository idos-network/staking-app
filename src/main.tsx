import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AnchoredToastProvider, ToastProvider } from "@/components/ui/toast";
import App from "./app";
import { AppKitProvider } from "./lib/appkit";
import "./index.css";

const rootElement = document.getElementById("root");

if (rootElement && !rootElement.innerHTML) {
  createRoot(rootElement).render(
    <StrictMode>
      <ToastProvider>
        <AnchoredToastProvider>
          <AppKitProvider>
            <App />
          </AppKitProvider>
        </AnchoredToastProvider>
      </ToastProvider>
    </StrictMode>
  );
}
