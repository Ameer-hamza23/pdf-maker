import { SymbolView, SymbolWeight } from "expo-symbols";
import { OpaqueColorValue, StyleProp, ViewStyle } from "react-native";

import type { IconSymbolName } from "./icon-symbol";

export function IconSymbol({
  name,
  size = 20,
  color,
  style,
  weight = "semibold",
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  return (
    <SymbolView
      name={name}
      tintColor={color}
      weight={weight}
      resizeMode="scaleAspectFit"
      style={[
        {
          width: size,
          height: size,
        },
        style,
      ]}
    />
  );
}
