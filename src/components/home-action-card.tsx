import { Link, type Href } from "expo-router";
import { useRef } from "react";
import {
  Animated,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { IconSymbol, type IconSymbolName } from "@/src/components/icon-symbol";
import { electricCuratorTheme, withAlpha } from "@/src/theme/electric-curator";

type HomeActionCardProps = {
  title: string;
  description: string;
  icon: IconSymbolName;
  href?: Href;
  tone?: "primary" | "sky" | "lilac" | "paper";
};

const { colors, radius, typography } = electricCuratorTheme;

const toneMap = {
  primary: {
    background: colors.primary,
    orb: withAlpha(colors.primaryContainer, 0.35),
    edge: withAlpha(colors.onPrimary, 0.16),
    iconBackground: withAlpha(colors.onPrimary, 0.14),
    iconColor: colors.onPrimary,
    titleColor: colors.onPrimary,
    descriptionColor: withAlpha(colors.onPrimary, 0.8),
    chipBackground: withAlpha(colors.onPrimary, 0.14),
    chipColor: colors.onPrimary,
  },
  sky: {
    background: colors.primaryContainer,
    orb: withAlpha(colors.surfaceContainerLowest, 0.45),
    edge: withAlpha(colors.primary, 0.14),
    iconBackground: withAlpha(colors.surfaceContainerLowest, 0.72),
    iconColor: colors.onPrimaryContainer,
    titleColor: colors.onPrimaryContainer,
    descriptionColor: withAlpha(colors.onPrimaryContainer, 0.82),
    chipBackground: withAlpha(colors.surfaceContainerLowest, 0.74),
    chipColor: colors.onPrimaryContainer,
  },
  lilac: {
    background: colors.secondaryContainer,
    orb: withAlpha(colors.surfaceContainerLowest, 0.42),
    edge: withAlpha(colors.onSecondaryContainer, 0.12),
    iconBackground: withAlpha(colors.surfaceContainerLowest, 0.78),
    iconColor: colors.onSecondaryContainer,
    titleColor: colors.onSurface,
    descriptionColor: withAlpha(colors.onSurface, 0.78),
    chipBackground: withAlpha(colors.surfaceContainerLowest, 0.8),
    chipColor: colors.onSecondaryContainer,
  },
  paper: {
    background: colors.surfaceContainerLowest,
    orb: withAlpha(colors.primaryContainer, 0.22),
    edge: withAlpha(colors.primary, 0.08),
    iconBackground: colors.primaryContainer,
    iconColor: colors.onPrimaryContainer,
    titleColor: colors.onSurface,
    descriptionColor: withAlpha(colors.onSurface, 0.76),
    chipBackground: withAlpha(colors.primaryContainer, 0.55),
    chipColor: colors.onPrimaryContainer,
  },
} as const;

export function HomeActionCard({
  title,
  description,
  icon,
  href,
  tone = "paper",
}: HomeActionCardProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const palette = toneMap[tone];

  // Animated values
  const scale = useRef(new Animated.Value(1)).current;
  const elevation = useRef(new Animated.Value(2)).current;

  const animateIn = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.97,
        useNativeDriver: false,
      }),
      Animated.timing(elevation, {
        toValue: 6,
        duration: 120,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const animateOut = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: false,
      }),
      Animated.timing(elevation, {
        toValue: 2,
        duration: 120,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const cardWidth = isTablet ? "31.5%" : "48%";

  const animatedStyle = {
    transform: [{ scale }],
    elevation,
    shadowOpacity: elevation.interpolate({
      inputRange: [2, 6],
      outputRange: [0.12, 0.28],
    }),
  };

  const content = (
    <>
      <View
        style={{
          position: "absolute",
          top: -18,
          right: -12,
          width: 84,
          height: 84,
          borderRadius: radius.pill,
          backgroundColor: palette.orb,
        }}
      />

      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 42,
          backgroundColor: palette.edge,
        }}
      />

      <View style={{ gap: 14, zIndex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              width: 46,
              height: 46,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: radius.pill,
              backgroundColor: palette.iconBackground,
            }}
          >
            <IconSymbol name={icon} size={20} color={palette.iconColor} />
          </View>

          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: radius.pill,
              backgroundColor: palette.chipColor,
              opacity: 0.75,
            }}
          />
        </View>

        <View style={{ gap: 4 }}>
          <Text
            selectable
            style={[
              typography.titleSm,
              { color: palette.titleColor, fontSize: 17 },
            ]}
          >
            {title}
          </Text>

          <Text
            selectable
            style={[
              typography.bodyMd,
              { color: palette.descriptionColor, lineHeight: 20 },
            ]}
          >
            {description}
          </Text>
        </View>
      </View>

      <View
        style={{
          alignSelf: "flex-start",
          marginTop: 16,
          paddingHorizontal: 12,
          paddingVertical: 7,
          borderRadius: radius.pill,
          backgroundColor: palette.chipBackground,
        }}
      >
        <Text
          selectable
          style={[
            typography.labelMd,
            { color: palette.chipColor, fontSize: 10, letterSpacing: 0.8 },
          ]}
        >
          OPEN
        </Text>
      </View>
    </>
  );

  const card = (
    <Animated.View
      style={[
        {
          flexBasis: cardWidth,
          minHeight: 148,
          padding: 16,
          borderRadius: radius.md,
          backgroundColor: palette.background,
          overflow: "hidden",
          justifyContent: "space-between",

          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 12,
        },
        animatedStyle,
      ]}
    >
      {content}
    </Animated.View>
  );

  if (href) {
    return (
      <Link href={href} asChild>
        <Pressable
          android_ripple={{ color: withAlpha("#000", 0.08) }}
          onPressIn={animateIn}
          onPressOut={animateOut}
        >
          {card}
        </Pressable>
      </Link>
    );
  }

  return card;
}
