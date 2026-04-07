import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import {
  SafeAreaView,
  type Edge,
} from "react-native-safe-area-context";

import { electricCuratorTheme } from "@/src/theme/electric-curator";

const { colors } = electricCuratorTheme;

type Props = {
  children: ReactNode;
  /** Defaults to all edges; tab screens often use `['top','left','right']` and pad scroll content for the bottom bar. */
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
};

/**
 * Uses `react-native-safe-area-context` (not RN’s deprecated SafeAreaView) for notch / status bar / home indicator.
 */
export function ScreenSafeArea({
  children,
  edges = ["top", "left", "right", "bottom"],
  style,
}: Props) {
  return (
    <SafeAreaView
      style={[{ flex: 1, backgroundColor: colors.surface }, style]}
      edges={edges}
    >
      {children}
    </SafeAreaView>
  );
}
