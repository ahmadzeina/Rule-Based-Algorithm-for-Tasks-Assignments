/**
 * Design Token System — implements design.md (Linear-style dark UI).
 * Single source of truth for color, typography, spacing and chart styling.
 */

export const COLORS = {
  // Backgrounds (design.md §2)
  background: {
    main: "#0F1115", // Main app background
    sidebar: "#17181C", // Sidebar background
    panel: "#222429", // Floating menus, dropdowns, inputs
    subtle: "#14161A", // Very subtle raised surface
  },
  // Text colors
  text: {
    primary: "#E2E2E2", // Headers, active items
    secondary: "#85868B", // Labels, descriptions, sidebar items
    placeholder: "#5F6368",
  },
  // Borders & dividers
  border: "#2D3139",
  borderStrong: "#3A3F49",
  // Interaction surfaces
  hover: "rgba(255, 255, 255, 0.04)",
  active: "rgba(255, 255, 255, 0.07)",
  // Accent & status colors
  accent: {
    scope: "#5E6AD2", // Brand accent / progress (Scope)
    started: "#F2C94C", // Warning / In progress (Started)
    completed: "#4CAF50", // Success / Completed
    alert: "#E57373", // Alert / current marker
  },
  // Background tints derived from accents (for pills and highlight rows)
  tint: {
    scope: "rgba(94, 106, 210, 0.16)",
    started: "rgba(242, 201, 76, 0.14)",
    completed: "rgba(76, 175, 80, 0.14)",
    alert: "rgba(229, 115, 115, 0.14)",
    neutral: "rgba(133, 134, 139, 0.16)",
  },
  // Chart-specific surfaces
  chart: {
    grid: "#23262D",
    axis: "#5F6368",
    surface: "#1A1C21",
  },
  // Legacy alias scales — mapped onto the design.md palette so any
  // older reference keeps rendering in-theme.
  gray: {
    50: "#16181D", 100: "#1D1F25", 200: "#2D3139", 300: "#3A3F49",
    400: "#5F6368", 500: "#85868B", 600: "#9A9CA1", 700: "#B9BBC0",
    800: "#D3D4D7", 900: "#E2E2E2",
  },
  primary: {
    50: "rgba(94,106,210,0.10)", 100: "rgba(94,106,210,0.22)",
    500: "#5E6AD2", 600: "#4C55A9", 700: "#8B94E0",
  },
  error: {
    50: "rgba(229,115,115,0.10)", 100: "rgba(229,115,115,0.22)",
    500: "#E57373", 600: "#E57373", 700: "#EFA3A3",
  },
  warning: {
    50: "rgba(242,201,76,0.10)", 100: "rgba(242,201,76,0.22)",
    500: "#F2C94C", 600: "#F2C94C", 700: "#F5D884",
  },
  success: {
    50: "rgba(76,175,80,0.10)", 100: "rgba(76,175,80,0.22)",
    500: "#4CAF50", 600: "#4CAF50", 700: "#82C985",
  },
  info: {
    50: "rgba(94,106,210,0.10)", 100: "rgba(94,106,210,0.22)",
    500: "#5E6AD2", 600: "#5E6AD2", 700: "#8B94E0",
  },
} as const;

// Typography scale (design.md §3)
const title = {
  fontSize: "26px",
  fontWeight: 600,
  lineHeight: 1.25,
  letterSpacing: "-0.01em",
  color: COLORS.text.primary,
};

export const TYPOGRAPHY = {
  title: { ...title },
  h1: { ...title },
  h2: { fontSize: "18px", fontWeight: 600, lineHeight: 1.35, color: COLORS.text.primary },
  h3: { fontSize: "14px", fontWeight: 600, lineHeight: 1.4, color: COLORS.text.primary },
  // Section headers: 13px, Medium, Secondary text
  sectionHeader: { fontSize: "13px", fontWeight: 500, lineHeight: 1.5, color: COLORS.text.secondary },
  // Body: 13px Regular
  body: { fontSize: "13px", fontWeight: 400, lineHeight: 1.6, color: COLORS.text.primary },
  // Small labels/metadata: 11px
  small: { fontSize: "11px", fontWeight: 400, lineHeight: 1.45, color: COLORS.text.secondary },
  meta: { fontSize: "12px", fontWeight: 400, lineHeight: 1.5, color: COLORS.text.secondary },
};

// Spacing scale — strict 8pt grid (design.md §4)
export const SPACING = {
  xs: "4px",
  sm: "8px",
  base: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  xxl: "48px",
  xxxl: "64px",
};

export const RADIUS = {
  sm: "4px",
  md: "6px",
  lg: "8px",
  xl: "12px",
};

export const BORDER = {
  default: `1px solid ${COLORS.border}`,
  subtle: `1px solid ${COLORS.border}`,
  focus: `2px solid ${COLORS.accent.scope}`,
};

export const SHADOW = {
  subtle: "none",
  standard: "none",
  // Reserved for floating menus only (design.md: no heavy drop shadows)
  menu: "0 12px 32px rgba(0, 0, 0, 0.5)",
};

export const BUTTON_STYLES = {
  primary: {
    background: COLORS.accent.scope,
    foreground: "#FFFFFF",
    hover: "#4C55A9",
    disabled: "#3A427A",
    disabledText: COLORS.text.secondary,
  },
  secondary: {
    background: "transparent",
    foreground: COLORS.text.primary,
    hover: COLORS.hover,
    disabled: "transparent",
    disabledText: COLORS.text.secondary,
  },
  danger: {
    background: "transparent",
    foreground: COLORS.accent.alert,
    hover: COLORS.tint.alert,
    disabled: "transparent",
    disabledText: COLORS.text.secondary,
  },
};

export const SIZES = {
  buttonSmall: "5px 10px",
  buttonMedium: "7px 14px",
  buttonLarge: "9px 18px",
  inputPadding: "8px 12px",
  cardPadding: "16px",
  cardPaddingLarge: "24px",
};

export const BREAKPOINTS = {
  mobile: "320px",
  tablet: "768px",
  desktop: "1024px",
  wide: "1280px",
};

/** Utilization → semantic color: <50 green, <80 gold, else red. */
export function utilizationColor(pct: number): string {
  if (pct < 50) return COLORS.accent.completed;
  if (pct < 80) return COLORS.accent.started;
  return COLORS.accent.alert;
}
