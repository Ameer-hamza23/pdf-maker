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
import {
  canShowInterstitialByInterval,
  defaultAdsPreferences,
  loadAdsPreferences,
  recordInterstitialShown,
  saveAdsPreferences,
  type AdsPreferences,
} from "@/src/ads/storage/adPreferences";

type TryInterstitialOptions = {
  /** Settings preview / tests — ignores route allowlist. */
  skipRouteCheck?: boolean;
};

type AdsContextValue = {
  preferences: AdsPreferences;
  prefsLoaded: boolean;
  setPreferences: (patch: Partial<AdsPreferences>) => Promise<void>;
  isOnline: boolean | null;
  bundleReady: boolean;
  activePathname: string;
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
  setVisible: (v: boolean) => void,
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
  const allowed = await canShowInterstitialByInterval();
  if (!allowed) {
    return false;
  }
  pathWhenAdRef.current = pathname;
  setVisible(true);
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
  const [interstitialVisible, setInterstitialVisible] = useState(false);
  const appStateRef = useRef(AppState.currentState);
  /** Set only after we run the one-time cold-start attempt on an allowed route. */
  const coldStartDoneRef = useRef(false);
  const pathWhenInterstitialShownRef = useRef<string | null>(null);

  const { isOnline, bundleReady } = useAdNetwork(
    preferences.prefetchWhenOnline,
  );

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
    setInterstitialVisible(false);
    if (!target) {
      return;
    }
    requestAnimationFrame(() => {
      if (activePathname !== target) {
        router.replace(target as Href);
      }
    });
  }, [activePathname, router]);

  const showInterstitialPreview = useCallback(() => {
    pathWhenInterstitialShownRef.current = activePathname;
    setInterstitialVisible(true);
  }, [activePathname]);

  const dismissInterstitialPreview = useCallback(() => {
    restoreRouteAfterAd();
  }, [restoreRouteAfterAd]);

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
      setInterstitialVisible,
      pathWhenInterstitialShownRef,
    );
  }, [prefsLoaded, preferences, bundleReady, isOnline, activePathname]);

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
          setInterstitialVisible,
          pathWhenInterstitialShownRef,
        );
      }
    });
    return () => sub.remove();
  }, [preferences, bundleReady, isOnline, activePathname]);

  const value = useMemo<AdsContextValue>(
    () => ({
      preferences,
      prefsLoaded,
      setPreferences,
      isOnline,
      bundleReady,
      activePathname,
      showInterstitialPreview,
      dismissInterstitialPreview,
      interstitialVisible,
    }),
    [
      preferences,
      prefsLoaded,
      setPreferences,
      isOnline,
      bundleReady,
      activePathname,
      showInterstitialPreview,
      dismissInterstitialPreview,
      interstitialVisible,
    ],
  );

  return (
    <AdsContext.Provider value={value}>
      {children}
      <StaticInterstitialAd
        visible={interstitialVisible}
        onClose={restoreRouteAfterAd}
        onLearnMore={restoreRouteAfterAd}
      />
    </AdsContext.Provider>
  );
}
