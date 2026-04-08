import type { Href } from "expo-router";
import { usePathname, useRouter } from "expo-router";
import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState } from "react-native";

import { shouldShowInterstitialForPath } from "@/src/ads/adRoutePolicy";
import { StaticInterstitialAd } from "@/src/ads/components/StaticInterstitialAd";
import { useAdNetwork } from "@/src/ads/hooks/useAdNetwork";
import { useInterstitialController } from "@/src/ads/hooks/useInterstitialController";
import {
  canShowInterstitialByInterval,
  defaultAdsPreferences,
  loadAdsPreferences,
  recordInterstitialShown,
  saveAdsPreferences,
  type AdsPreferences,
} from "@/src/ads/storage/adPreferences";

type TryInterstitialOptions = {
  skipRouteCheck?: boolean;
};

type AdsContextValue = {
  preferences: AdsPreferences;
  prefsLoaded: boolean;
  setPreferences: (patch: Partial<AdsPreferences>) => Promise<void>;
  isOnline: boolean | null;
  sdkReady: boolean;
  bundleReady: boolean;
  activePathname: string;
  isNativeAdMob: boolean;
  adError: string | null;
  showInterstitialPreview: () => void;
  dismissInterstitialPreview: () => void;
  interstitialVisible: boolean;
};

const AdsContext = createContext<AdsContextValue | null>(null);

export function useAds(): AdsContextValue {
  const ctx = useContext(AdsContext);
  if (!ctx) {
    throw new Error("useAds must be used within AdsProvider");
  }
  return ctx;
}

export function useAdsOptional(): AdsContextValue | null {
  return useContext(AdsContext);
}

async function tryOpenInterstitial(
  preferences: AdsPreferences,
  bundleReady: boolean,
  isOnline: boolean | null,
  pathname: string,
  showInterstitial: () => boolean,
  requestInterstitial: () => void,
  pathWhenAdRef: { current: string | null },
  options?: TryInterstitialOptions,
): Promise<boolean> {
  if (!preferences.interstitialEnabled || !preferences.interstitialOnOpen) {
    return false;
  }
  if (!options?.skipRouteCheck && !shouldShowInterstitialForPath(pathname)) {
    return false;
  }
  if (preferences.prefetchWhenOnline && !bundleReady && isOnline === false) {
    return false;
  }
  if (!bundleReady) {
    requestInterstitial();
    return false;
  }

  const allowed = await canShowInterstitialByInterval();
  if (!allowed) {
    requestInterstitial();
    return false;
  }

  const opened = showInterstitial();
  if (!opened) {
    pathWhenAdRef.current = null;
    requestInterstitial();
    return false;
  }

  pathWhenAdRef.current = pathname;
  await recordInterstitialShown();
  return true;
}

type AdsProviderProps = {
  children: ReactNode;
};

/**
 * Must render under Expo Router so `usePathname` / `useRouter` work.
 */
export function AdsProvider({ children }: AdsProviderProps) {
  const router = useRouter();
  const activePathname = usePathname() ?? "";

  const [preferences, setPreferencesState] = useState<AdsPreferences>(
    defaultAdsPreferences,
  );
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const appStateRef = useRef(AppState.currentState);
  const coldStartDoneRef = useRef(false);
  const pathWhenInterstitialShownRef = useRef<string | null>(null);

  const { isOnline } = useAdNetwork();

  useEffect(() => {
    void loadAdsPreferences().then((p) => {
      setPreferencesState(p);
      setPrefsLoaded(true);
    });
  }, []);

  const setPreferences = useCallback(async (patch: Partial<AdsPreferences>) => {
    await saveAdsPreferences(patch);
    setPreferencesState((prev) => ({ ...prev, ...patch }));
  }, []);

  const restoreRouteAfterAd = useCallback(() => {
    const target = pathWhenInterstitialShownRef.current;
    pathWhenInterstitialShownRef.current = null;

    if (!target) {
      return;
    }

    requestAnimationFrame(() => {
      if (activePathname !== target) {
        router.replace(target as Href);
      }
    });
  }, [activePathname, router]);

  const {
    sdkReady,
    interstitialReady: bundleReady,
    interstitialVisible,
    adError,
    isNativeAdMob,
    showInterstitial,
    dismissInterstitial,
    requestInterstitial,
  } = useInterstitialController({
    enabled: preferences.interstitialEnabled,
    prefetchWhenOnline: preferences.prefetchWhenOnline,
    isOnline,
    onClose: restoreRouteAfterAd,
  });

  const showInterstitialPreview = useCallback(() => {
    const shown = showInterstitial();
    if (!shown) {
      requestInterstitial();
      return;
    }

    pathWhenInterstitialShownRef.current = activePathname;
  }, [activePathname, requestInterstitial, showInterstitial]);

  const dismissInterstitialPreview = useCallback(() => {
    dismissInterstitial();
  }, [dismissInterstitial]);

  useEffect(() => {
    if (!prefsLoaded || coldStartDoneRef.current) {
      return;
    }
    if (isOnline === null) {
      return;
    }
    if (!activePathname) {
      return;
    }
    if (!shouldShowInterstitialForPath(activePathname)) {
      return;
    }

    coldStartDoneRef.current = true;

    void tryOpenInterstitial(
      preferences,
      bundleReady,
      isOnline,
      activePathname,
      showInterstitial,
      requestInterstitial,
      pathWhenInterstitialShownRef,
    );
  }, [
    activePathname,
    bundleReady,
    isOnline,
    prefsLoaded,
    preferences,
    requestInterstitial,
    showInterstitial,
  ]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      const prev = appStateRef.current;
      appStateRef.current = next;
      const wasBackground = /inactive|background/.test(prev);

      if (next === "active" && wasBackground && activePathname) {
        void tryOpenInterstitial(
          preferences,
          bundleReady,
          isOnline,
          activePathname,
          showInterstitial,
          requestInterstitial,
          pathWhenInterstitialShownRef,
        );
      }
    });

    return () => sub.remove();
  }, [
    activePathname,
    bundleReady,
    isOnline,
    preferences,
    requestInterstitial,
    showInterstitial,
  ]);

  const value = useMemo<AdsContextValue>(
    () => ({
      preferences,
      prefsLoaded,
      setPreferences,
      isOnline,
      sdkReady,
      bundleReady,
      activePathname,
      isNativeAdMob,
      adError,
      showInterstitialPreview,
      dismissInterstitialPreview,
      interstitialVisible,
    }),
    [
      preferences,
      prefsLoaded,
      setPreferences,
      isOnline,
      sdkReady,
      bundleReady,
      activePathname,
      isNativeAdMob,
      adError,
      showInterstitialPreview,
      dismissInterstitialPreview,
      interstitialVisible,
    ],
  );

  return (
    <AdsContext.Provider value={value}>
      {children}
      {!isNativeAdMob ? (
        <StaticInterstitialAd
          visible={interstitialVisible}
          onClose={dismissInterstitialPreview}
          onLearnMore={dismissInterstitialPreview}
        />
      ) : null}
    </AdsContext.Provider>
  );
}
