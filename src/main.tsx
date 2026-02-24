import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AnchoredToastProvider, ToastProvider } from "@/components/ui/toast";
import { AppKitProvider } from "./lib/appkit";
import { routeTree } from "./routeTree.gen";
import "./index.css";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  // biome-ignore lint/style/useConsistentTypeDefinitions: module augmentation requires interface
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root");

if (rootElement && !rootElement.innerHTML) {
  createRoot(rootElement).render(
    <StrictMode>
      <ToastProvider>
        <AnchoredToastProvider>
          <AppKitProvider>
            <RouterProvider router={router} />
          </AppKitProvider>
        </AnchoredToastProvider>
      </ToastProvider>
    </StrictMode>
  );
}
