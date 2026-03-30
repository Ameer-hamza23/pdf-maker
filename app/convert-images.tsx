import { useEditImages } from "@/src/context/edit-images-context";
import { electricCuratorTheme } from "@/src/theme/electric-curator";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { DraggableGrid } from "react-native-draggable-grid";

const { colors, spacing, radius, typography } = electricCuratorTheme;
const screenWidth = Dimensions.get("window").width;
// Adjusting size to account for margins and padding
const imageSize = (screenWidth - spacing.md * 2) / 3 - 8;

interface MyGridItem {
  id: string;
  uri: string;
  processedUri?: string;
  key: string; // DraggableGrid REQUIREMENT
}

export default function ConvertImagesPage() {
  const router = useRouter();
  const { images, clearImages } = useEditImages();

  // Initialize grid data with required 'key' property
  const [gridData, setGridData] = useState<MyGridItem[]>([]);

  useEffect(() => {
    if (images.length > 0) {
      setGridData(
        images.map((img) => ({
          ...img,
          key: img.id, // Ensure key is a string and unique
        })),
      );
    }
  }, [images]);

  // The renderItem must return a component that doesn't
  // interfere with the grid's own PanResponder
  const renderItem = (item: MyGridItem) => {
    return (
      <View
        key={item.key}
        style={[styles.imageCard, { width: imageSize, height: imageSize }]}
      >
        <Image
          source={{ uri: item.processedUri || item.uri }}
          style={styles.image}
        />
        {/* Optional: Add a small handle icon or overlay if desired */}
      </View>
    );
  };

  const handleDragRelease = (newData: MyGridItem[]) => {
    setGridData(newData);
    // Note: If you want to sync this back to your context immediately:
    // syncContext(newData);
  };

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.container}>
        <Text style={styles.title}>Convert Images</Text>
        <Text style={styles.subtitle}>
          Press and hold an image to drag and reorder.
        </Text>

        <View style={styles.gridContainer}>
          <DraggableGrid
            numColumns={3}
            renderItem={renderItem}
            data={gridData}
            onDragRelease={handleDragRelease}
            itemHeight={imageSize + 8} // Add extra space for margins
            style={styles.draggableGrid}
          />
        </View>

        {/* Footer Area */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.addCard}
            onPress={() => router.push("/scan")}
          >
            <MaterialIcons
              name="add-a-photo"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.addText}>Add More</Text>
          </TouchableOpacity>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Batch Details</Text>
            <Text style={styles.infoText}>
              {gridData.length} item{gridData.length === 1 ? "" : "s"} sorted
              and ready.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              console.log("Final Order:", gridData);
              // logic to convert to PDF or process final order
            }}
          >
            <Text style={styles.buttonText}>Generate Document</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  container: {
    flex: 1,
    padding: spacing.md,
  },
  title: {
    ...typography.headlineMd,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.md,
  },
  gridContainer: {
    flex: 1, // This allows the grid to take up available space
    marginBottom: spacing.md,
  },
  draggableGrid: {
    backgroundColor: colors.surface,
    justifyContent: "flex-start",
  },
  imageCard: {
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.surfaceContainerLow,
    // Add a slight elevation or shadow to make items look "grabbable"
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  footer: {
    gap: spacing.sm,
  },
  addCard: {
    flexDirection: "row",
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceContainerLow,
    gap: spacing.sm,
  },
  addText: {
    color: colors.primary,
    fontWeight: "600",
  },
  infoCard: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
  },
  infoTitle: {
    ...typography.titleSmall,
    color: colors.onSurface,
    marginBottom: 4,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.onSurfaceVariant,
  },
  button: {
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  buttonText: {
    color: colors.onPrimary,
    fontWeight: "700",
    fontSize: 16,
  },
});
