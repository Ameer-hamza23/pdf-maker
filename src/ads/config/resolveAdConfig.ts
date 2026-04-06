import { defaultAdUnitIds } from "@/src/ads/config/adUnitIds";

export type ResolvedAdConfig = {
  admobAppIdIos: string;
  admobAppIdAndroid: string;
  bannerUnitId: string;
  interstitialUnitId: string;
};

/**
 * Resolves AdMob config: `EXPO_PUBLIC_*` from `.env` wins over defaults in `adUnitIds.ts`.
 */
export function getResolvedAdConfig(): ResolvedAdConfig {
  const ios = process.env.EXPO_PUBLIC_ADMOB_APP_ID_IOS?.trim();
  const android = process.env.EXPO_PUBLIC_ADMOB_APP_ID_ANDROID?.trim();
  const banner = process.env.EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID?.trim();
  const interstitial =
    process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_UNIT_ID?.trim();

  return {
    admobAppIdIos: ios || defaultAdUnitIds.admobAppIdIos,
    admobAppIdAndroid: android || defaultAdUnitIds.admobAppIdAndroid,
    bannerUnitId: banner || defaultAdUnitIds.bannerUnitId,
    interstitialUnitId: interstitial || defaultAdUnitIds.interstitialUnitId,
  };
}

/** Short preview for settings UI (never log full production IDs in analytics). */
export function maskId(id: string): string {
  if (id.length <= 12) {
    return "••••";
  }
  return `${id.slice(0, 8)}…${id.slice(-6)}`;
}
