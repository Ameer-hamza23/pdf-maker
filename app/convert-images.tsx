import { Link } from "expo-router";
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { useEditImages } from "@/src/context/edit-images-context";
import { electricCuratorTheme } from "@/src/theme/electric-curator";

const { colors, spacing, radius, typography } = electricCuratorTheme;

export default function ConvertImagesPage() {
  const { images, clearImages } = useEditImages();

  const fileName = (uri: string) => uri.split("/").pop() ?? "image.jpg";

  const getFilterStyle = (filter: string) => {
    if (filter === "mono") return { tintColor: "#999999", opacity: 0.9 };
    if (filter === "warm") return { tintColor: "rgba(255, 180, 100, 0.35)" };
    if (filter === "cool") return { tintColor: "rgba(100, 180, 255, 0.25)" };
    return {};
  };

  return (
    <View style={styles.page}>
      <Text style={styles.title}>Convert Images</Text>
      <Text style={styles.subtitle}>
        Review your selected images before export.
      </Text>

      <FlatList
        data={images}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.previewRow}
        renderItem={({ item }) => (
          <View style={styles.previewCard}>
            <Image source={{ uri: item.processedUri || item.uri }} style={[styles.previewImage, getFilterStyle(item.filter)]} />
            <Text style={styles.fileName} numberOfLines={1}>
              {fileName(item.processedUri || item.uri)}
            </Text>
          </View>
        )}
      />

      <View style={styles.detailsCard}>
        <Text style={styles.detailHeading}>Selected images</Text>
        <Text style={styles.detailText}>
          {images.length} image{images.length === 1 ? "" : "s"} ready for
          conversion.
        </Text>
      </View>

      <TouchableOpacity style={styles.exportButton} onPress={clearImages}>
        <Text style={styles.exportText}>Finish and clear</Text>
      </TouchableOpacity>

      <Link href="/" style={styles.backButton}>
        <Text style={styles.backText}>Back to home</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  title: {
    ...typography.headlineMd,
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  previewRow: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  previewCard: {
    width: 140,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
    overflow: "hidden",
    alignItems: "center",
  },
  previewImage: {
    width: 140,
    height: 140,
    resizeMode: "cover",
  },
  fileName: {
    width: "100%",
    padding: spacing.sm,
    color: colors.onSurface,
    fontSize: 12,
  },
  detailsCard: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
  },
  detailHeading: {
    ...typography.titleSm,
    marginBottom: spacing.xs,
  },
  detailText: {
    color: colors.onSurface,
  },
  exportButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
  },
  exportText: {
    color: colors.onPrimary,
    fontWeight: "700",
  },
  backButton: {
    marginTop: spacing.sm,
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  backText: {
    color: colors.primary,
    fontWeight: "700",
  },
});
