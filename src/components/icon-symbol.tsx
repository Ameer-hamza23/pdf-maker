import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ComponentProps } from "react";
import { OpaqueColorValue, StyleProp, TextStyle } from "react-native";

export type IconSymbolName =
  | "house"
  | "house.fill"
  | "folder"
  | "folder.fill"
  | "camera"
  | "camera.fill"
  | "doc.fill"
  | "doc.text.fill"
  | "clock.fill"
  | "viewfinder"
  | "viewfinder.circle.fill"
  | "gearshape"
  | "gearshape.fill";

const MAPPING: Record<IconSymbolName, ComponentProps<typeof MaterialIcons>["name"]> =
  {
    house: "home",
    "house.fill": "home-filled",
    folder: "folder-open",
    "folder.fill": "folder",
    camera: "camera-alt",
    "camera.fill": "camera-alt",
    "doc.fill": "picture-as-pdf",
    "doc.text.fill": "description",
    "clock.fill": "history",
    viewfinder: "center-focus-strong",
    "viewfinder.circle.fill": "document-scanner",
    gearshape: "settings",
    "gearshape.fill": "settings",
  };

export function IconSymbol({
  name,
  size = 20,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
