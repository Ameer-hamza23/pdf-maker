const colors = {
  primary: "#0058ba",
  primaryDim: "#004da4",
  primaryContainer: "#6c9fff",
  secondaryContainer: "#c6cfff",
  onSecondaryContainer: "#1f3ea2",
  surface: "#f7f5ff",
  surfaceContainerLow: "#efefff",
  surfaceContainerLowest: "#ffffff",
  onSurface: "#232c51",
  onPrimary: "#f0f2ff",
  onPrimaryContainer: "#00214e",
  outlineVariant: "#a2abd7",
} as const;

const spacing = {
  xs: 8,
  sm: 12,
  md: 24,
  lg: 32,
  xl: 64,
} as const;

const radius = {
  sm: 8,
  md: 24,
  pill: 999,
} as const;

export const electricCuratorTheme = {
  name: "The Electric Curator",
  colors,
  spacing,
  radius,
  typography: {
    displayLg: {
      color: colors.onSurface,
      fontSize: 56,
      lineHeight: 60,
      fontWeight: "700" as const,
      letterSpacing: -1.12,
    },
    headlineMd: {
      color: colors.onSurface,
      fontSize: 28,
      lineHeight: 34,
      fontWeight: "600" as const,
    },
    titleSm: {
      color: colors.onSurface,
      fontSize: 16,
      lineHeight: 20,
      fontWeight: "800" as const,
    },
    bodyLg: {
      color: colors.onSurface,
      fontSize: 18,
      lineHeight: 28,
      fontWeight: "500" as const,
    },
    bodyMd: {
      color: colors.onSurface,
      fontSize: 14,
      lineHeight: 22,
      fontWeight: "500" as const,
    },
    labelMd: {
      color: colors.primary,
      fontSize: 12,
      lineHeight: 16,
      fontWeight: "800" as const,
      letterSpacing: 1,
      textTransform: "uppercase" as const,
    },
  },
  effects: {
    glassSurface: withAlpha(colors.surface, 0.7),
    ghostBorder: withAlpha(colors.outlineVariant, 0.15),
    focusRing: withAlpha(colors.primary, 0.2),
    ambientShadow: "0 20px 40px rgba(35, 44, 81, 0.06)",
  },
} as const;

export function withAlpha(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);

  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
