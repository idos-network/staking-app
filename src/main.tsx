import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Spinner } from "@/components/ui/spinner";
import { AnchoredToastProvider, ToastProvider } from "@/components/ui/toast";
import { AppKitProvider } from "@/lib/appkit";
import { routeTree } from "./routeTree.gen";

import "./index.css";

const queryClient = new QueryClient();

const router = createRouter({
  routeTree,
  defaultPendingComponent: () => (
    <div className="grid h-full place-content-center">
      <Spinner className="size-6" />
    </div>
  ),
});

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
          <QueryClientProvider client={queryClient}>
            <AppKitProvider>
              <RouterProvider router={router} />
            </AppKitProvider>
          </QueryClientProvider>
        </AnchoredToastProvider>
      </ToastProvider>
    </StrictMode>
  );
}
