import type {
  UseInterstitialControllerOptions,
  UseInterstitialControllerResult,
} from "./interstitialController.types";
import { useInterstitialControllerFallback } from "./useInterstitialControllerFallback";

export function useInterstitialController(
  options: UseInterstitialControllerOptions,
): UseInterstitialControllerResult {
  return useInterstitialControllerFallback(options);
}
