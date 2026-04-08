import { useCallback, useState } from "react";

import type {
  UseInterstitialControllerOptions,
  UseInterstitialControllerResult,
} from "./interstitialController.types";

export function useInterstitialControllerFallback(
  options: UseInterstitialControllerOptions,
): UseInterstitialControllerResult {
  const { onClose } = options;
  const [interstitialVisible, setInterstitialVisible] = useState(false);

  const showInterstitial = useCallback(() => {
    setInterstitialVisible(true);
    return true;
  }, []);

  const dismissInterstitial = useCallback(() => {
    setInterstitialVisible(false);
    onClose();
  }, [onClose]);

  const requestInterstitial = useCallback(() => {}, []);

  return {
    sdkReady: false,
    interstitialReady: true,
    interstitialVisible,
    adError: null,
    isNativeAdMob: false,
    showInterstitial,
    dismissInterstitial,
    requestInterstitial,
  };
}
