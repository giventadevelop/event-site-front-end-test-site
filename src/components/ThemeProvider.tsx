"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Fallback type if ThemeProviderProps is not exported
// type ThemeProviderProps = React.PropsWithChildren<Record<string, any>>;

export function ThemeProvider({ children, ...props }: React.PropsWithChildren<Record<string, any>>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
