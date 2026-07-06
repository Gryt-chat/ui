import { createTheme } from "@mui/material/styles";
import type { ThemeOptions } from "@mui/material/styles";

export const grytTokens = {
  color: {
    bg: "#111318",
    surface: "#1a1d24",
    surfaceRaised: "#1e2028",
    border: "#2b303d",
    text: "#e0e0e6",
    muted: "#888888",
    accent: "#968FF8",
    accentLight: "#b4afff",
    secondary: "#7dd3fc",
    success: "#4ade80",
    danger: "#f87171",
    warning: "#fbbf24"
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 20,
    xl: 28,
    full: 999
  }
} as const;

export type GrytThemeOptions = ThemeOptions;

export function createGrytTheme(options: GrytThemeOptions = {}) {
  return createTheme({
    palette: {
      mode: "dark",
      primary: {
        main: grytTokens.color.accent,
        light: grytTokens.color.accentLight,
        dark: "#7e77df",
        contrastText: "#141126"
      },
      secondary: {
        main: grytTokens.color.secondary,
        contrastText: "#07131c"
      },
      success: {
        main: grytTokens.color.success
      },
      error: {
        main: grytTokens.color.danger
      },
      warning: {
        main: grytTokens.color.warning
      },
      background: {
        default: grytTokens.color.bg,
        paper: grytTokens.color.surface
      },
      text: {
        primary: grytTokens.color.text,
        secondary: grytTokens.color.muted
      },
      divider: grytTokens.color.border
    },
    typography: {
      fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
      button: {
        textTransform: "none",
        fontWeight: 650
      }
    },
    shape: {
      borderRadius: grytTokens.radius.lg
    },
    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: true
        },
        styleOverrides: {
          root: {
            borderRadius: grytTokens.radius.full,
            minHeight: 40,
            paddingInline: 20
          }
        }
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: grytTokens.radius.full
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            borderRadius: grytTokens.radius.lg
          }
        }
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: grytTokens.radius.xl
          }
        }
      }
    },
    ...options
  });
}
