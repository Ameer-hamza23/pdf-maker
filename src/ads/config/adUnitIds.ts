/**
 * Fallback AdMob identifiers when env vars are unset.
 * Replace with your real units from AdMob, or set EXPO_PUBLIC_* in `.env`.
 * Google’s official test IDs are safe for development builds.
 */
export const defaultAdUnitIds = {
  admobAppIdIos: "ca-app-pub-3940256099942544~1458002511",
  admobAppIdAndroid: "ca-app-pub-3940256099942544~3347511713",
  bannerUnitId:
    "ca-app-pub-3940256099942544/6300978111",
  interstitialUnitId:
    "ca-app-pub-3940256099942544/1033173712",
} as const;
