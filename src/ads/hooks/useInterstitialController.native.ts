import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  getAdMobRequestConfiguration,
  getInterstitialUnitIdForRuntime,
} from "../config/resolveAdConfig";
import { getGoogleMobileAds } from "../googleMobileAds";
import type {
  UseInterstitialControllerOptions,
  UseInterstitialControllerResult,
} from "./interstitialController.types";
import { useInterstitialControllerFallback } from "./useInterstitialControllerFallback";

const interstitialRequestOptions = {
  requestNonPersonalizedAdsOnly: true,
} as const;

const googleMobileAds = getGoogleMobileAds();

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return "AdMob could not load an interstitial.";
}

function useNativeInterstitialControllerImpl({
  enabled,
  prefetchWhenOnline,
  isOnline,
  onClose,
}: UseInterstitialControllerOptions): UseInterstitialControllerResult {
  if (!googleMobileAds) {
    throw new Error("Google Mobile Ads native module is not available.");
  }

  const [sdkReady, setSdkReady] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);
  const unitId = useMemo(() => getInterstitialUnitIdForRuntime(), []);
  const requestConfiguration = useMemo(() => getAdMobRequestConfiguration(), []);
  const previouslyClosedRef = useRef(false);

  const { error, isClosed, isLoaded, isOpened, load, show } =
    googleMobileAds.useInterstitialAd(
      sdkReady && enabled ? unitId : null,
      interstitialRequestOptions,
    );

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        await googleMobileAds.default().setRequestConfiguration(requestConfiguration);
        await googleMobileAds.default().initialize();

        if (!active) {
          return;
        }

        setSdkReady(true);
        setAdError(null);
      } catch (sdkError) {
        if (!active) {
          return;
        }

        setSdkReady(false);
        setAdError(toErrorMessage(sdkError));
      }
    })();

    return () => {
      active = false;
    };
  }, [requestConfiguration]);

  const shouldLoad =
    sdkReady && enabled && (!prefetchWhenOnline || isOnline !== false);

  useEffect(() => {
    if (!shouldLoad || isLoaded || isOpened) {
      return;
    }

    load();
  }, [isLoaded, isOpened, load, shouldLoad]);

  useEffect(() => {
    if (!error) {
      return;
    }

    setAdError(toErrorMessage(error));
  }, [error]);

  useEffect(() => {
    if (isLoaded) {
      setAdError(null);
    }
  }, [isLoaded]);

  useEffect(() => {
    if (isClosed && !previouslyClosedRef.current) {
      onClose();
    }

    previouslyClosedRef.current = isClosed;
  }, [isClosed, onClose]);

  const showInterstitial = useCallback(() => {
    if (!isLoaded) {
      if (shouldLoad) {
        load();
      }
      return false;
    }

    try {
      show();
      return true;
    } catch (sdkError) {
      setAdError(toErrorMessage(sdkError));
      return false;
    }
  }, [isLoaded, load, shouldLoad, show]);

  const dismissInterstitial = useCallback(() => {
    onClose();
  }, [onClose]);

  const requestInterstitial = useCallback(() => {
    if (!shouldLoad) {
      return;
    }

    load();
  }, [load, shouldLoad]);

  return {
    sdkReady,
    interstitialReady: isLoaded,
    interstitialVisible: isOpened && !isClosed,
    adError,
    isNativeAdMob: true,
    showInterstitial,
    dismissInterstitial,
    requestInterstitial,
  };
}

export function useInterstitialController(
  options: UseInterstitialControllerOptions,
): UseInterstitialControllerResult {
  const interstitialControllerImpl = googleMobileAds
    ? useNativeInterstitialControllerImpl
    : useInterstitialControllerFallback;

  return interstitialControllerImpl(options);
}
