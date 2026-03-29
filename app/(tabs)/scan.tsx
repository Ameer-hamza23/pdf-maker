import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { QRResultModal } from "@/src/components/QRResultModal";
import { useEditImages } from "@/src/context/edit-images-context";
import { electricCuratorTheme } from "@/src/theme/electric-curator";

const CameraViewAny = CameraView as any;

const { colors, spacing, radius } = electricCuratorTheme;

export default function ScanPage() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState<"off" | "on">("off");
  const [autoFocus, setAutoFocus] = useState(true);
  const [scanEnabled, setScanEnabled] = useState(true);
  const router = useRouter();
  const { addImages } = useEditImages();
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState<string | null>(null);

  if (!permission) {
    return <View style={styles.container} />;
  }

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (!scannedData) {
      setScannedData(data);
    }
  };

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="Grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  function toggleFlash() {
    setFlash((current) => (current === "off" ? "on" : "off"));
  }

  function toggleScanEnabled() {
    setScanEnabled((current) => !current);
  }

  function toggleAutoFocus() {
    setAutoFocus((current) => !current);
  }

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "We need access to your photos to make this work!",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const uris = result.assets.map((asset) => asset.uri);
      addImages(uris);
      router.push("/edit-images");
    }
  };

  return (
    <View style={styles.container}>
      <CameraViewAny
        style={styles.camera}
        facing={facing}
        enableTorch={flash === "on"}
        autoFocus={autoFocus}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        barCodeScannerSettings={{ barCodeTypes: ["qr"] }}
        onBarcodeScanned={
          scanEnabled && !scannedData ? handleBarCodeScanned : undefined
        }
        onBarCodeScanned={
          scanEnabled && !scannedData ? handleBarCodeScanned : undefined
        }
      />

      <QRResultModal
        isVisible={!!scannedData}
        data={scannedData}
        onClose={() => setScannedData(null)}
      />

      <View style={styles.topControls}>
        <TouchableOpacity
          style={[styles.iconButton, scanEnabled && styles.iconButtonActive]}
          onPress={toggleScanEnabled}
        >
          <MaterialIcons
            name="qr-code-scanner"
            size={20}
            color={scanEnabled ? colors.primaryContainer : colors.onSurface}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={toggleFlash}>
          <MaterialIcons
            name={flash === "on" ? "flash-on" : "flash-off"}
            size={20}
            color={flash === "on" ? colors.primaryContainer : colors.onSurface}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconButton, autoFocus && styles.iconButtonActive]}
          onPress={toggleAutoFocus}
        >
          <MaterialIcons
            name="center-focus-strong"
            size={20}
            color={autoFocus ? colors.primaryContainer : colors.onSurface}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={toggleCameraFacing}
        >
          <MaterialIcons
            name="flip-camera-ios"
            size={20}
            color={colors.onSurface}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.focusOverlay} pointerEvents="none">
        <View style={styles.focusBox}>
          <View style={[styles.focusCorner, styles.topLeft]} />
          <View style={[styles.focusCorner, styles.topRight]} />
          <View style={[styles.focusCorner, styles.bottomLeft]} />
          <View style={[styles.focusCorner, styles.bottomRight]} />
        </View>
      </View>

      <View style={styles.bottomRow}>
        <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
          <MaterialIcons
            name="photo-library"
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>

        <View style={styles.captureWrapper}>
          <TouchableOpacity style={styles.captureButton} />
          <Text style={styles.captureLabel}>Capture</Text>
        </View>

        <View style={styles.placeholder} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  topControls: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    right: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  iconButtonActive: {
    backgroundColor: colors.primary,
  },
  focusOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },
  focusBox: {
    width: 240,
    height: 320,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  focusCorner: {
    position: "absolute",
    width: 24,
    height: 24,
    borderColor: colors.onPrimary,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
  bottomRow: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
  },
  galleryButton: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceContainerLowest,
  },
  captureWrapper: {
    alignItems: "center",
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 72,
    borderWidth: 4,
    borderColor: colors.surfaceContainerLowest,
    backgroundColor: colors.onPrimary,
  },
  captureLabel: {
    marginTop: 8,
    color: colors.onPrimary,
    fontSize: 12,
    fontWeight: "600",
  },
  placeholder: {
    width: 48,
    height: 48,
  },
});
