import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  bannerEnabled: "@ads/bannerEnabled",
  interstitialEnabled: "@ads/interstitialEnabled",
  interstitialOnOpen: "@ads/interstitialOnOpen",
  prefetchWhenOnline: "@ads/prefetchWhenOnline",
  staticBundleReady: "@ads/staticBundleReady",
  lastInterstitialAt: "@ads/lastInterstitialAt",
} as const;

export type AdsPreferences = {
  bannerEnabled: boolean;
  interstitialEnabled: boolean;
  interstitialOnOpen: boolean;
  prefetchWhenOnline: boolean;
};

export const defaultAdsPreferences: AdsPreferences = {
  bannerEnabled: true,
  interstitialEnabled: true,
  interstitialOnOpen: true,
  prefetchWhenOnline: true,
};

const defaults = defaultAdsPreferences;

export async function loadAdsPreferences(): Promise<AdsPreferences> {
  try {
    const [
      bannerEnabled,
      interstitialEnabled,
      interstitialOnOpen,
      prefetchWhenOnline,
    ] = await Promise.all([
      AsyncStorage.getItem(KEYS.bannerEnabled),
      AsyncStorage.getItem(KEYS.interstitialEnabled),
      AsyncStorage.getItem(KEYS.interstitialOnOpen),
      AsyncStorage.getItem(KEYS.prefetchWhenOnline),
    ]);

    return {
      bannerEnabled: bannerEnabled === null ? defaults.bannerEnabled : bannerEnabled === "1",
      interstitialEnabled:
        interstitialEnabled === null
          ? defaults.interstitialEnabled
          : interstitialEnabled === "1",
      interstitialOnOpen:
        interstitialOnOpen === null
          ? defaults.interstitialOnOpen
          : interstitialOnOpen === "1",
      prefetchWhenOnline:
        prefetchWhenOnline === null
          ? defaults.prefetchWhenOnline
          : prefetchWhenOnline === "1",
    };
  } catch {
    return { ...defaults };
  }
}

export async function saveAdsPreferences(
  patch: Partial<AdsPreferences>,
): Promise<void> {
  const entries: [string, string][] = [];
  if (patch.bannerEnabled !== undefined) {
    entries.push([KEYS.bannerEnabled, patch.bannerEnabled ? "1" : "0"]);
  }
  if (patch.interstitialEnabled !== undefined) {
    entries.push([
      KEYS.interstitialEnabled,
      patch.interstitialEnabled ? "1" : "0",
    ]);
  }
  if (patch.interstitialOnOpen !== undefined) {
    entries.push([
      KEYS.interstitialOnOpen,
      patch.interstitialOnOpen ? "1" : "0",
    ]);
  }
  if (patch.prefetchWhenOnline !== undefined) {
    entries.push([
      KEYS.prefetchWhenOnline,
      patch.prefetchWhenOnline ? "1" : "0",
    ]);
  }
  await AsyncStorage.multiSet(entries);
}

export async function markStaticAdBundleReady(): Promise<void> {
  await AsyncStorage.setItem(KEYS.staticBundleReady, String(Date.now()));
}

export async function getLastBundleReadyAt(): Promise<number | null> {
  const raw = await AsyncStorage.getItem(KEYS.staticBundleReady);
  if (!raw) {
    return null;
  }
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

const MIN_INTERSTITIAL_GAP_MS = 3 * 60 * 1000;

export async function canShowInterstitialByInterval(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(KEYS.lastInterstitialAt);
  if (!raw) {
    return true;
  }
  const last = Number(raw);
  if (!Number.isFinite(last)) {
    return true;
  }
  return Date.now() - last >= MIN_INTERSTITIAL_GAP_MS;
}

export async function recordInterstitialShown(): Promise<void> {
  await AsyncStorage.setItem(KEYS.lastInterstitialAt, String(Date.now()));
}
