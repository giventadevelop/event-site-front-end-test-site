"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import React, { useState } from "react";

import { trpc } from "./client";
import { getUrl } from "./utils";

import SuperJSON from "superjson";

export default function TrpcProvider({
  children,
  cookies = "",
}: {
  children: React.ReactNode;
  cookies?: string;
}) {
  const [queryClient] = useState(() => new QueryClient({}));
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === "development" ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: getUrl(),
          transformer: SuperJSON,
          headers() {
            return {
              cookie: cookies,
              "x-trpc-source": "react",
            };
          },
        }),
      ],
    }),
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
