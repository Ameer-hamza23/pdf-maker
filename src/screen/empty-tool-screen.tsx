import { Stack } from "expo-router";
import { ScrollView } from "react-native";

import { electricCuratorTheme } from "@/src/theme/electric-curator";

type EmptyToolScreenProps = {
  title: string;
};

const { colors } = electricCuratorTheme;

export function EmptyToolScreen({ title }: EmptyToolScreenProps) {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title,
          headerStyle: { backgroundColor: colors.surfaceContainerLow },
          headerShadowVisible: false,
          headerTintColor: colors.onSurface,
          headerTitleStyle: {
            color: colors.onSurface,
            fontSize: 18,
            fontWeight: "700",
          },
        }}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ flex: 1, backgroundColor: colors.surface }}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </>
  );
}
