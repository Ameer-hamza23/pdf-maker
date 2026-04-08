import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

export function useAdNetwork() {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      const online =
        state.isConnected === true &&
        (state.isInternetReachable === true ||
          state.isInternetReachable === null);

      setIsOnline(online);
    });

    void NetInfo.fetch().then((state) => {
      const online =
        state.isConnected === true &&
        (state.isInternetReachable === true ||
          state.isInternetReachable === null);

      setIsOnline(online);
    });

    return () => {
      unsub();
    };
  }, []);

  return { isOnline };
}
