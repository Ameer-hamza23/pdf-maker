import { LinearGradient } from "expo-linear-gradient";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { electricCuratorTheme, withAlpha } from "@/src/theme/electric-curator";

const { colors, spacing, radius } = electricCuratorTheme;

type Props = {
  visible: boolean;
  onClose: () => void;
  onLearnMore?: () => void;
};

/**
 * Full-screen static interstitial placeholder (professional layout).
 * Replace with `InterstitialAd` from `react-native-google-mobile-ads` when ready.
 */
export function StaticInterstitialAd({
  visible,
  onClose,
  onLearnMore,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <LinearGradient
          colors={["#0f172a", "#1e3a5f", colors.surface]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.2, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.content}>
          <View style={styles.adPill}>
            <Text style={styles.adPillText}>Sponsored</Text>
          </View>

          <View style={styles.hero}>
            <Text style={styles.heroKicker}>Discover</Text>
            <Text style={styles.heroTitle}>Work faster with smart PDF tools</Text>
            <Text style={styles.heroBody}>
              This is a static interstitial preview. Hook your AdMob interstitial unit here for
              production traffic.
            </Text>
          </View>

          <View style={styles.mockCard}>
            <View style={styles.mockShine} />
            <Text style={styles.mockTitle}>Your ad creative</Text>
            <Text style={styles.mockSub}>
              320×480 safe area · Tap targets 48dp+ · Close always visible
            </Text>
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={onLearnMore}
              style={({ pressed }) => [styles.primaryBtn, pressed && styles.btnPressed]}
            >
              <Text style={styles.primaryBtnText}>Learn more</Text>
            </Pressable>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.ghostBtn, pressed && styles.btnPressed]}
            >
              <Text style={styles.ghostBtnText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: "space-between",
  },
  adPill: {
    alignSelf: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: withAlpha("#ffffff", 0.12),
  },
  adPillText: {
    color: withAlpha("#ffffff", 0.85),
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  hero: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  heroKicker: {
    color: withAlpha(colors.primaryContainer, 0.95),
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  heroTitle: {
    color: "#f8fafc",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  heroBody: {
    color: withAlpha("#e2e8f0", 0.88),
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
  },
  mockCard: {
    marginVertical: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: withAlpha("#ffffff", 0.08),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: withAlpha("#ffffff", 0.12),
    overflow: "hidden",
  },
  mockShine: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: withAlpha("#ffffff", 0.04),
  },
  mockTitle: {
    color: "#f1f5f9",
    fontSize: 18,
    fontWeight: "700",
  },
  mockSub: {
    marginTop: spacing.xs,
    color: withAlpha("#cbd5e1", 0.9),
    fontSize: 13,
    lineHeight: 20,
  },
  actions: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  primaryBtn: {
    paddingVertical: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryContainer,
    alignItems: "center",
  },
  primaryBtnText: {
    color: colors.onPrimaryContainer,
    fontSize: 16,
    fontWeight: "800",
  },
  ghostBtn: {
    paddingVertical: 14,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: withAlpha("#ffffff", 0.35),
    alignItems: "center",
  },
  ghostBtnText: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "600",
  },
  btnPressed: {
    opacity: 0.88,
  },
});
