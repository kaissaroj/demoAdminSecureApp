import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { Button, Platform, StyleSheet } from "react-native";

import { HelloWave } from "@/components/hello-wave";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { DeviceControl } from "@/modules/expo-device-control";

export default function HomeScreen() {
  const [isDeviceOwner, setIsDeviceOwner] = useState<boolean | null>(null);
  const [installBlockResult, setInstallBlockResult] = useState<string | null>(
    null,
  );
  const [kioskMessage, setKioskMessage] = useState<string | null>(null);

  useEffect(() => {
    setIsDeviceOwner(DeviceControl.isDeviceOwner());
  }, []);

  const onToggleInstallBlock = (blocked: boolean) => {
    const success = DeviceControl.setInstallAppsBlocked(blocked);
    setInstallBlockResult(
      success
        ? blocked
          ? "Installations blocked."
          : "Installations allowed."
        : "Action failed (device owner required).",
    );
  };

  const onEnableKiosk = () => {
    try {
      DeviceControl.enableKioskMode();
      setKioskMessage("Kiosk mode enabled.");
    } catch (error: unknown) {
      const err = error instanceof Error ? error.message : "Failed to enable kiosk mode.";
      setKioskMessage(err);
    }
  };

  const onDisableKiosk = () => {
    try {
      DeviceControl.disableKioskMode();
      setKioskMessage("Kiosk mode disabled.");
    } catch (error: unknown) {
      const err = error instanceof Error ? error.message : "Failed to disable kiosk mode.";
      setKioskMessage(err);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Device Owner Status</ThemedText>
        <ThemedText>
          {isDeviceOwner === null
            ? "Checking..."
            : isDeviceOwner
              ? "This app is Device Owner."
              : "Not set as Device Owner."}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Control App Installations</ThemedText>
        <ThemedText>
          {Platform.OS === "android"
            ? "Block or allow installing other apps (requires Device Owner)."
            : "Android-only feature."}
        </ThemedText>
        {Platform.OS === "android" && (
          <>
            <Button
              title="Block installs"
              onPress={() => onToggleInstallBlock(true)}
            />
            <Button
              title="Allow installs"
              onPress={() => onToggleInstallBlock(false)}
            />
            {installBlockResult && <ThemedText>{installBlockResult}</ThemedText>}
          </>
        )}
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Single-App Kiosk</ThemedText>
        <ThemedText>
          {Platform.OS === "android"
            ? "Lock or unlock this app as the only allowed task (Device Owner required)."
            : "Android-only feature."}
        </ThemedText>
        {Platform.OS === "android" && (
          <>
            <Button title="Enable kiosk mode" onPress={onEnableKiosk} />
            <Button title="Disable kiosk mode" onPress={onDisableKiosk} />
            {kioskMessage && <ThemedText>{kioskMessage}</ThemedText>}
          </>
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
