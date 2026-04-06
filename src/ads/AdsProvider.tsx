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

type AdsContextValue = {
  preferences: AdsPreferences;
  prefsLoaded: boolean;
  setPreferences: (patch: Partial<AdsPreferences>) => Promise<void>;
  isOnline: boolean | null;
  bundleReady: boolean;
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
  setVisible: (v: boolean) => void,
): Promise<boolean> {
  if (!preferences.interstitialEnabled || !preferences.interstitialOnOpen) {
    return false;
  }
  if (preferences.prefetchWhenOnline && !bundleReady && isOnline === false) {
    return false;
  }
  const allowed = await canShowInterstitialByInterval();
  if (!allowed) {
    return false;
  }
  setVisible(true);
  await recordInterstitialShown();
  return true;
}

export function AdsProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferencesState] = useState<AdsPreferences>(
    defaultAdsPreferences,
  );
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const [interstitialVisible, setInterstitialVisible] = useState(false);
  const appStateRef = useRef(AppState.currentState);
  const coldStartDoneRef = useRef(false);

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

  const showInterstitialPreview = useCallback(() => {
    setInterstitialVisible(true);
  }, []);

  const dismissInterstitialPreview = useCallback(() => {
    setInterstitialVisible(false);
  }, []);

  useEffect(() => {
    if (!prefsLoaded || coldStartDoneRef.current) {
      return;
    }
    if (isOnline === null) {
      return;
    }
    coldStartDoneRef.current = true;
    void tryOpenInterstitial(
      preferences,
      bundleReady,
      isOnline,
      setInterstitialVisible,
    );
  }, [prefsLoaded, preferences, bundleReady, isOnline]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      const prev = appStateRef.current;
      appStateRef.current = next;
      const wasBackground = /inactive|background/.test(prev);
      if (next === "active" && wasBackground) {
        void tryOpenInterstitial(
          preferences,
          bundleReady,
          isOnline,
          setInterstitialVisible,
        );
      }
    });
    return () => sub.remove();
  }, [preferences, bundleReady, isOnline]);

  const value = useMemo<AdsContextValue>(
    () => ({
      preferences,
      prefsLoaded,
      setPreferences,
      isOnline,
      bundleReady,
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
        onClose={() => setInterstitialVisible(false)}
        onLearnMore={() => setInterstitialVisible(false)}
      />
    </AdsContext.Provider>
  );
}
