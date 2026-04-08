import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAds } from "@/src/ads/AdsProvider";
import { shouldShowInterstitialForPath } from "@/src/ads/adRoutePolicy";
import { defaultAdUnitIds } from "@/src/ads/config/adUnitIds";
import {
  getConfiguredTestDeviceIds,
  getResolvedAdConfig,
  isUsingGoogleTestUnits,
  maskId,
} from "@/src/ads/config/resolveAdConfig";
import { electricCuratorTheme, withAlpha } from "@/src/theme/electric-curator";

const { colors, spacing, radius, typography } = electricCuratorTheme;
const muted = withAlpha(colors.onSurface, 0.65);

export default function AdsSettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    preferences,
    setPreferences,
    isOnline,
    sdkReady,
    bundleReady,
    activePathname,
    isNativeAdMob,
    adError,
    showInterstitialPreview,
  } = useAds();

  const cfg = useMemo(() => getResolvedAdConfig(), []);
  const testDeviceIds = useMemo(() => getConfiguredTestDeviceIds(), []);
  const usingGoogleTestUnits = useMemo(() => isUsingGoogleTestUnits(), []);
  const runtimeMode = useMemo(() => {
    if (usingGoogleTestUnits) {
      return "Google demo units";
    }
    if (testDeviceIds.length > 0) {
      return "Real units + test devices";
    }
    return "Real units";
  }, [testDeviceIds.length, usingGoogleTestUnits]);
  const testDevicePreview = useMemo(
    () =>
      testDeviceIds.length > 0
        ? testDeviceIds
            .map((id) => (id === "EMULATOR" ? id : maskId(id)))
            .join(", ")
        : "None",
    [testDeviceIds],
  );
  const bannerUsesFallbackId = cfg.bannerUnitId === defaultAdUnitIds.bannerUnitId;
  const interstitialUsesFallbackId =
    cfg.interstitialUnitId === defaultAdUnitIds.interstitialUnitId;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.backBtn}
          accessibilityLabel="Go back"
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.topTitle}>Ads</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingBottom: insets.bottom + spacing.xl,
          gap: spacing.lg,
        }}
      >
        <Text style={[typography.bodyMd, { color: muted }]}>
          Native AdMob is enabled for Android and iOS builds. Expo Go will not load this SDK, so
          use a development build or release build when testing ads. IDs below resolve from{" "}
          <Text style={{ fontWeight: "700" }}>.env</Text> or{" "}
          <Text style={{ fontWeight: "700" }}>src/ads/config/adUnitIds.ts</Text>.
        </Text>

        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Network</Text>
          <Text style={styles.statusValue}>
            {isOnline === null ? "Checking..." : isOnline ? "Online" : "Offline"}
          </Text>

          <Text style={[styles.statusLabel, { marginTop: spacing.md }]}>SDK</Text>
          <Text style={styles.statusValue}>
            {isNativeAdMob ? (sdkReady ? "Ready" : "Starting") : "Web fallback"}
          </Text>
          <Text style={[styles.statusHint, { marginTop: spacing.xs }]}>
            App IDs are compiled into the native build through{" "}
            <Text style={{ fontWeight: "700" }}>app.config.js</Text>.
          </Text>
          <Text style={[styles.statusHint, { marginTop: spacing.xs }]}>
            Runtime mode: <Text style={{ fontWeight: "700" }}>{runtimeMode}</Text>
          </Text>

          <Text style={[styles.statusLabel, { marginTop: spacing.md }]}>Active route</Text>
          <Text style={styles.routeValue} numberOfLines={2} selectable>
            {activePathname || "-"}
          </Text>
          <Text style={[styles.statusHint, { marginTop: spacing.xs }]}>
            Fullscreen ads only on safe screens (not editor / camera). Current:{" "}
            {shouldShowInterstitialForPath(activePathname) ? "allowed" : "blocked"}
          </Text>

          <Text style={[styles.statusLabel, { marginTop: spacing.md }]}>Interstitial</Text>
          <Text style={styles.statusValue}>{bundleReady ? "Loaded" : "Loading"}</Text>
          <Text style={[styles.statusHint, { marginTop: spacing.xs }]}>
            Test devices: <Text style={{ fontWeight: "700" }}>{testDevicePreview}</Text>
          </Text>

          {adError ? (
            <Text style={[styles.statusHint, { marginTop: spacing.sm, color: "#b91c1c" }]}>
              Last ad error: {adError}
            </Text>
          ) : null}
        </View>

        <Text style={typography.labelMd}>Placement</Text>

        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={typography.titleSm}>Home banner</Text>
            <Text style={[typography.bodyMd, { color: muted, fontSize: 13 }]}>
              Show the banner slot on the home screen.
            </Text>
          </View>
          <Switch
            value={preferences.bannerEnabled}
            onValueChange={(value) => void setPreferences({ bannerEnabled: value })}
            trackColor={{ false: colors.outlineVariant, true: colors.primaryContainer }}
            thumbColor={preferences.bannerEnabled ? colors.primary : "#f4f4f5"}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={typography.titleSm}>Fullscreen ads</Text>
            <Text style={[typography.bodyMd, { color: muted, fontSize: 13 }]}>
              Enable interstitial placements on safe screens.
            </Text>
          </View>
          <Switch
            value={preferences.interstitialEnabled}
            onValueChange={(value) =>
              void setPreferences({ interstitialEnabled: value })
            }
            trackColor={{ false: colors.outlineVariant, true: colors.primaryContainer }}
            thumbColor={preferences.interstitialEnabled ? colors.primary : "#f4f4f5"}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={typography.titleSm}>Show on app open</Text>
            <Text style={[typography.bodyMd, { color: muted, fontSize: 13 }]}>
              After prefetch, show when returning to the app (rate-limited).
            </Text>
          </View>
          <Switch
            value={preferences.interstitialOnOpen}
            onValueChange={(value) =>
              void setPreferences({ interstitialOnOpen: value })
            }
            trackColor={{ false: colors.outlineVariant, true: colors.primaryContainer }}
            thumbColor={preferences.interstitialOnOpen ? colors.primary : "#f4f4f5"}
            disabled={!preferences.interstitialEnabled}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={typography.titleSm}>Prefetch when online</Text>
            <Text style={[typography.bodyMd, { color: muted, fontSize: 13 }]}>
              Load ads while connected so interstitials are ready sooner.
            </Text>
          </View>
          <Switch
            value={preferences.prefetchWhenOnline}
            onValueChange={(value) =>
              void setPreferences({ prefetchWhenOnline: value })
            }
            trackColor={{ false: colors.outlineVariant, true: colors.primaryContainer }}
            thumbColor={preferences.prefetchWhenOnline ? colors.primary : "#f4f4f5"}
          />
        </View>

        <Text style={typography.labelMd}>Preview</Text>
        <Pressable
          style={({ pressed }) => [styles.previewBtn, pressed && { opacity: 0.9 }]}
          onPress={showInterstitialPreview}
        >
          <MaterialIcons name="fullscreen" size={20} color={colors.onPrimary} />
          <Text style={styles.previewBtnText}>
            {isNativeAdMob ? "Show fullscreen ad" : "Show fullscreen preview"}
          </Text>
        </Pressable>
        <Text style={[typography.bodyMd, { color: muted, fontSize: 13 }]}>
          If nothing opens immediately, the interstitial is still warming up. Tap once, wait a
          moment, then try again.
        </Text>

        <Text style={typography.labelMd}>Resolved IDs (masked)</Text>
        <View style={styles.idCard}>
          <IdLine label="App ID (iOS)" value={maskId(cfg.admobAppIdIos)} />
          <IdLine label="App ID (Android)" value={maskId(cfg.admobAppIdAndroid)} />
          <IdLine label="Banner unit" value={maskId(cfg.bannerUnitId)} />
          <IdLine label="Interstitial unit" value={maskId(cfg.interstitialUnitId)} />
          <IdLine
            label="Banner source"
            value={bannerUsesFallbackId ? "Google test ID" : "Configured in .env"}
          />
          <IdLine
            label="Interstitial source"
            value={interstitialUsesFallbackId ? "Google test ID" : "Configured in .env"}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function IdLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.idRow}>
      <Text style={styles.idLabel}>{label}</Text>
      <Text style={styles.idValue} selectable>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: withAlpha(colors.outlineVariant, 0.5),
  },
  backBtn: {
    padding: spacing.xs,
  },
  topTitle: {
    ...typography.headlineMd,
    fontSize: 18,
  },
  statusCard: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: withAlpha(colors.outlineVariant, 0.45),
  },
  statusLabel: {
    ...typography.labelMd,
    fontSize: 10,
    opacity: 0.85,
  },
  statusValue: {
    ...typography.titleSm,
    fontSize: 16,
  },
  routeValue: {
    ...typography.bodyMd,
    fontSize: 13,
    fontFamily: "monospace",
    color: colors.onSurface,
  },
  statusHint: {
    ...typography.bodyMd,
    fontSize: 12,
    color: muted,
    lineHeight: 18,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
  },
  rowText: {
    flex: 1,
    gap: 4,
  },
  previewBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  previewBtnText: {
    color: colors.onPrimary,
    fontWeight: "800",
    fontSize: 15,
  },
  idCard: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: withAlpha(colors.outlineVariant, 0.45),
    gap: spacing.sm,
  },
  idRow: {
    gap: 4,
  },
  idLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  idValue: {
    fontSize: 13,
    fontFamily: "monospace",
    color: colors.onSurface,
  },
});
