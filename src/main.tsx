import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { Spinner } from "@/components/ui/spinner";
import { AnchoredToastProvider, ToastProvider } from "@/components/ui/toast";
import { AppKitProvider } from "@/lib/appkit";

import { routeTree } from "./routeTree.gen";

import "./index.css";

function hashQueryKey(queryKey: unknown): string {
  return JSON.stringify(queryKey, (_key, value) =>
    typeof value === "bigint" ? value.toString() : value,
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { queryKeyHashFn: hashQueryKey },
  },
});

const router = createRouter({
  defaultPendingComponent: () => (
    <div className="grid h-full place-content-center">
      <Spinner className="size-6" />
    </div>
  ),
  routeTree,
});

declare module "@tanstack/react-router" {
  // oxlint-disable-next-line @typescript-eslint/consistent-type-definitions -- module augmentation requires interface
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
    </StrictMode>,
  );
}
