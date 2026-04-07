import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

import { markStaticAdBundleReady } from "@/src/ads/storage/adPreferences";

export function useAdNetwork(prefetchWhenOnline: boolean) {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [bundleReady, setBundleReady] = useState(false);

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      const online =
        state.isConnected === true &&
        (state.isInternetReachable === true ||
          state.isInternetReachable === null);
      setIsOnline(online);
      if (online && prefetchWhenOnline) {
        void markStaticAdBundleReady().then(() => setBundleReady(true));
      }
    });

    void NetInfo.fetch().then((state) => {
      const online =
        state.isConnected === true &&
        (state.isInternetReachable === true ||
          state.isInternetReachable === null);
      setIsOnline(online);
      if (online && prefetchWhenOnline) {
        void markStaticAdBundleReady().then(() => setBundleReady(true));
      }
    });

    return () => {
      unsub();
    };
  }, [prefetchWhenOnline]);

  return { isOnline, bundleReady };
}
