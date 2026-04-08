import { NativeModules, TurboModuleRegistry } from "react-native";

const MODULE_NAME = "RNGoogleMobileAdsModule";

type GoogleMobileAdsModule = typeof import("react-native-google-mobile-ads");

let cachedModule: GoogleMobileAdsModule | null | undefined;

function resolveNativeModule() {
  const turboModule =
    typeof TurboModuleRegistry?.get === "function"
      ? TurboModuleRegistry.get(MODULE_NAME)
      : null;
  const legacyModule = (NativeModules as Record<string, unknown>)[MODULE_NAME];

  return turboModule ?? legacyModule ?? null;
}

export function isGoogleMobileAdsNativeAvailable(): boolean {
  return resolveNativeModule() != null;
}

export function getGoogleMobileAds(): GoogleMobileAdsModule | null {
  if (!isGoogleMobileAdsNativeAvailable()) {
    return null;
  }

  if (cachedModule === undefined) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cachedModule = require("react-native-google-mobile-ads") as GoogleMobileAdsModule;
  }

  return cachedModule;
}
