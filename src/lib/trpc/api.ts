import "server-only";

import { appRouter } from "@/lib/server/routers/_app";
import { env } from "@/lib/env.mjs";
import { createTRPCContext } from "./context";

import {
  createTRPCProxyClient,
  loggerLink,
  httpBatchLink,
} from "@trpc/client";
import SuperJSON from "superjson";

export const api = createTRPCProxyClient<typeof appRouter>({
  links: [
    loggerLink({
      enabled: (op) =>
        env.NODE_ENV === "development" ||
        (op.direction === "down" && op.result instanceof Error),
    }),
    httpBatchLink({
      url: "/api/trpc",
      transformer: SuperJSON,
    }),
  ],
});
