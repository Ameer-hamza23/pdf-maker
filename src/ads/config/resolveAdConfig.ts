import { defaultAdUnitIds } from "@/src/ads/config/adUnitIds";

export type ResolvedAdConfig = {
  admobAppIdIos: string;
  admobAppIdAndroid: string;
  bannerUnitId: string;
  interstitialUnitId: string;
};

const truthyPattern = /^(1|true|yes|on)$/i;

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

/**
 * Resolves AdMob config: `EXPO_PUBLIC_*` from `.env` wins over defaults in `adUnitIds.ts`.
 */
export function getResolvedAdConfig(): ResolvedAdConfig {
  const ios = readEnv("EXPO_PUBLIC_ADMOB_APP_ID_IOS");
  const android = readEnv("EXPO_PUBLIC_ADMOB_APP_ID_ANDROID");
  const banner = readEnv("EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID");
  const interstitial = readEnv("EXPO_PUBLIC_ADMOB_INTERSTITIAL_UNIT_ID");

  return {
    admobAppIdIos: ios || defaultAdUnitIds.admobAppIdIos,
    admobAppIdAndroid: android || defaultAdUnitIds.admobAppIdAndroid,
    bannerUnitId: banner || defaultAdUnitIds.bannerUnitId,
    interstitialUnitId: interstitial || defaultAdUnitIds.interstitialUnitId,
  };
}

export function getConfiguredTestDeviceIds(): string[] {
  if (!__DEV__) {
    return [];
  }

  const raw = readEnv("EXPO_PUBLIC_ADMOB_TEST_DEVICE_IDS");
  const ids = raw
    ? raw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  return Array.from(new Set(["EMULATOR", ...ids]));
}

export function getAdMobRequestConfiguration(): {
  testDeviceIdentifiers?: string[];
} {
  const testDeviceIdentifiers = getConfiguredTestDeviceIds();

  return testDeviceIdentifiers.length > 0
    ? { testDeviceIdentifiers }
    : {};
}

export function shouldForceGoogleTestUnits(): boolean {
  return truthyPattern.test(readEnv("EXPO_PUBLIC_ADMOB_FORCE_TEST_IDS") ?? "");
}

export function getBannerUnitIdForRuntime(): string {
  return __DEV__ && shouldForceGoogleTestUnits()
    ? defaultAdUnitIds.bannerUnitId
    : getResolvedAdConfig().bannerUnitId;
}

export function getInterstitialUnitIdForRuntime(): string {
  return __DEV__ && shouldForceGoogleTestUnits()
    ? defaultAdUnitIds.interstitialUnitId
    : getResolvedAdConfig().interstitialUnitId;
}

export function isUsingGoogleTestUnits(): boolean {
  return (
    getBannerUnitIdForRuntime() === defaultAdUnitIds.bannerUnitId &&
    getInterstitialUnitIdForRuntime() === defaultAdUnitIds.interstitialUnitId
  );
}

/** Short preview for settings UI (never log full production IDs in analytics). */
export function maskId(id: string): string {
  if (!id.trim()) {
    return "not set";
  }
  if (id.length <= 12) {
    return "****";
  }
  return `${id.slice(0, 8)}...${id.slice(-6)}`;
}
