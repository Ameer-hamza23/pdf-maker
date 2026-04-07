import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { electricCuratorTheme, withAlpha } from "@/src/theme/electric-curator";

const { colors, spacing, radius, typography } = electricCuratorTheme;

type Props = {
  onPress?: () => void;
  /** When false, component returns null (still reserves no space). */
  visible?: boolean;
};

/**
 * Static, professional placeholder for an AdMob banner slot.
 * Swap for `BannerAd` from `react-native-google-mobile-ads` when integrating the SDK.
 */
export function StaticBannerAd({ onPress, visible = true }: Props) {
  if (!visible) {
    return null;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel="Advertisement placeholder"
    >
      <LinearGradient
        colors={[colors.surfaceContainerLowest, colors.surfaceContainerLow]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.adBadge}>
          <Text style={styles.adBadgeText}>Ad</Text>
        </View>
        <View style={styles.row}>
          <View style={styles.iconTile}>
            <Text style={styles.iconGlyph}>◆</Text>
          </View>
          <View style={styles.copy}>
            <Text style={styles.headline} numberOfLines={1}>
              Premium PDF tools
            </Text>
            <Text style={styles.sub} numberOfLines={2}>
              Static preview — replace with AdMob banner unit.
            </Text>
          </View>
          <View style={styles.cta}>
            <Text style={styles.ctaText}>Open</Text>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.md,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: withAlpha(colors.outlineVariant, 0.6),
  },
  pressed: {
    opacity: 0.92,
  },
  gradient: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 72,
    justifyContent: "center",
  },
  adBadge: {
    position: "absolute",
    top: spacing.xs,
    right: spacing.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: withAlpha(colors.onSurface, 0.06),
  },
  adBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
    color: withAlpha(colors.onSurface, 0.45),
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingRight: 56,
  },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: withAlpha(colors.primary, 0.12),
    alignItems: "center",
    justifyContent: "center",
  },
  iconGlyph: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "700",
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  headline: {
    ...typography.titleSm,
    fontSize: 15,
  },
  sub: {
    ...typography.bodyMd,
    fontSize: 12,
    lineHeight: 16,
    color: withAlpha(colors.onSurface, 0.55),
  },
  cta: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  ctaText: {
    color: colors.onPrimary,
    fontWeight: "800",
    fontSize: 13,
  },
});
