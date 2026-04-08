export type UseInterstitialControllerOptions = {
  enabled: boolean;
  prefetchWhenOnline: boolean;
  isOnline: boolean | null;
  onClose: () => void;
};

export type UseInterstitialControllerResult = {
  sdkReady: boolean;
  interstitialReady: boolean;
  interstitialVisible: boolean;
  adError: string | null;
  isNativeAdMob: boolean;
  showInterstitial: () => boolean;
  dismissInterstitial: () => void;
  requestInterstitial: () => void;
};
