import { ScrollView, Text, View } from "react-native";

import { electricCuratorTheme } from "@/src/theme/electric-curator";

type ElectricScreenProps = {
  eyebrow: string;
  headline: string;
  description: string;
  cardTitle: string;
  cardBody: string;
  chipLabel: string;
  actionLabel: string;
};

const { colors, spacing, radius, typography } = electricCuratorTheme;

export function ElectricScreen({
  eyebrow,
  headline,
  description,
  cardTitle,
  cardBody,
  chipLabel,
  actionLabel,
}: ElectricScreenProps) {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1, backgroundColor: colors.surface }}
      contentContainerStyle={{
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
        paddingBottom: 140,
        gap: spacing.lg,
      }}
    >
      <View style={{ gap: spacing.sm }}>
        <Text selectable style={typography.labelMd}>
          {eyebrow}
        </Text>
        <Text selectable style={typography.displayLg}>
          {headline}
        </Text>
        <Text selectable style={typography.bodyLg}>
          {description}
        </Text>
      </View>

      <View
        style={{
          gap: spacing.sm,
          padding: spacing.md,
          borderRadius: radius.md,
          backgroundColor: colors.surfaceContainerLow,
        }}
      >
        <View
          style={{
            gap: spacing.sm,
            padding: spacing.md,
            borderRadius: radius.md,
            backgroundColor: colors.surfaceContainerLowest,
          }}
        >
          <Text selectable style={typography.titleSm}>
            {cardTitle}
          </Text>
          <Text selectable style={typography.headlineMd}>
            {cardBody}
          </Text>

          <View
            style={{
              alignSelf: "flex-start",
              paddingHorizontal: 18,
              paddingVertical: 12,
              borderRadius: radius.pill,
              backgroundColor: colors.primary,
            }}
          >
            <Text
              selectable
              style={{
                color: colors.onPrimary,
                fontSize: 14,
                fontWeight: "800",
                letterSpacing: 0.4,
              }}
            >
              {actionLabel}
            </Text>
          </View>
        </View>

        <View
          style={{
            alignSelf: "flex-start",
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: radius.pill,
            backgroundColor: colors.primaryContainer,
          }}
        >
          <Text
            selectable
            style={{
              color: colors.onPrimaryContainer,
              fontSize: 12,
              fontWeight: "800",
              letterSpacing: 0.8,
              textTransform: "uppercase",
            }}
          >
            {chipLabel}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
