import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { StaticBannerAd } from "./StaticBannerAd";
import { getBannerUnitIdForRuntime } from "../config/resolveAdConfig";
import { getGoogleMobileAds } from "../googleMobileAds";
import { electricCuratorTheme, withAlpha } from "@/src/theme/electric-curator";

const { colors, radius, spacing, typography } = electricCuratorTheme;
const googleMobileAds = getGoogleMobileAds();

type Props = {
  visible?: boolean;
};

export function AdBanner({ visible = true }: Props) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const unitId = useMemo(() => getBannerUnitIdForRuntime(), []);

  if (!visible) {
    return null;
  }

  if (!googleMobileAds) {
    return (
      <View style={[styles.wrap, { padding: spacing.md }]}>
        <Text style={styles.hint}>
          ⚠️ AdMob native module not found. Real ads will only show in a Custom Dev Client, not inside Expo Go.
        </Text>
      </View>
    );
  }

  const { BannerAd, BannerAdSize } = googleMobileAds;

  return (
    <View style={styles.wrap}>
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        onAdLoaded={() => setErrorMessage(null)}
        onAdFailedToLoad={(error) => setErrorMessage(error.message)}
      />
      {errorMessage ? (
        <Text style={styles.hint} numberOfLines={2}>
          {errorMessage}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: withAlpha(colors.outlineVariant, 0.5),
    backgroundColor: colors.surfaceContainerLowest,
  },
  hint: {
    ...typography.bodyMd,
    paddingHorizontal: spacing.sm,
    fontSize: 12,
    lineHeight: 16,
    color: withAlpha(colors.onSurface, 0.6),
    textAlign: "center",
  },
});
