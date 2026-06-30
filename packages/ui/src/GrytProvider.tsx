import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import type { ReactNode } from "react";
import { createGrytTheme } from "./theme/createGrytTheme";

export interface GrytProviderProps {
  children: ReactNode;
  theme?: Theme;
  disableBaseline?: boolean;
}

const defaultTheme = createGrytTheme();

export function GrytProvider({
  children,
  theme = defaultTheme,
  disableBaseline = false
}: GrytProviderProps) {
  return (
    <ThemeProvider theme={theme}>
      {!disableBaseline ? <CssBaseline /> : null}
      {children}
    </ThemeProvider>
  );
}
