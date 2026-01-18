import { Feather } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { HelloWave } from "@/components/hello-wave";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { DeviceControl } from "@/modules/expo-device-control";

type Tone = "primary" | "secondary" | "outline" | "danger";

export default function HomeScreen() {
  const [isDeviceOwner, setIsDeviceOwner] = useState<boolean | null>(null);
  const [installBlockResult, setInstallBlockResult] = useState<string | null>(
    null,
  );
  const [kioskMessage, setKioskMessage] = useState<string | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<Record<string, unknown> | null>(
    null,
  );

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
      const err =
        error instanceof Error ? error.message : "Failed to enable kiosk mode.";
      setKioskMessage(err);
    }
  };

  const onDisableKiosk = () => {
    try {
      DeviceControl.disableKioskMode();
      setKioskMessage("Kiosk mode disabled.");
    } catch (error: unknown) {
      const err =
        error instanceof Error
          ? error.message
          : "Failed to disable kiosk mode.";
      setKioskMessage(err);
    }
  };

  const onFetchDeviceInfo = () => {
    if (Platform.OS !== "android") {
      setDeviceInfo({ error: "Device info is Android-only." });
      return;
    }

    try {
      const info = DeviceControl.getDeviceInfo();
      setDeviceInfo(info);
    } catch (error: unknown) {
      const err =
        error instanceof Error ? error.message : "Failed to fetch device info.";
      setDeviceInfo({ error: err });
    }
  };

  const isAndroid = Platform.OS === "android";
  const accent = useThemeColor({ light: "#0ea5e9", dark: "#38bdf8" }, "tint");
  const surface = useThemeColor(
    { light: "#ffffff", dark: "#0b1424" },
    "background",
  );
  const softSurface = useThemeColor(
    { light: "#f3f6fb", dark: "#0f1a2d" },
    "background",
  );
  const border = useThemeColor({ light: "#d8e4f0", dark: "#1f2d44" }, "icon");
  const textColor = useThemeColor({}, "text");

  const ownershipTone = useMemo<Tone | "warn" | "info">(() => {
    if (isDeviceOwner === null) return "info";
    return isDeviceOwner ? "primary" : "warn";
  }, [isDeviceOwner]);

  const ownershipLabel = useMemo(() => {
    if (isDeviceOwner === null) return "Checking status";
    return isDeviceOwner ? "Device owner" : "Ownership missing";
  }, [isDeviceOwner]);

  const StatusPill = ({
    label,
    tone = "info",
  }: {
    label: string;
    tone?: Tone | "warn" | "info";
  }) => {
    const palette: Record<
      Tone | "warn" | "info",
      { bg: string; color: string }
    > = {
      primary: { bg: "#0ea5e91f", color: accent },
      secondary: { bg: "#22c55e1a", color: "#16a34a" },
      outline: { bg: `${textColor}0d`, color: textColor },
      danger: { bg: "#f43f5e1f", color: "#f43f5e" },
      warn: { bg: "#f59e0b1a", color: "#f59e0b" },
      info: { bg: "#a5b4fc1f", color: "#6366f1" },
    };

    const paletteEntry = palette[tone];

    return (
      <View
        style={[
          styles.statusPill,
          {
            backgroundColor: paletteEntry.bg,
            borderColor: paletteEntry.color,
          },
        ]}
      >
        <ThemedText
          style={[styles.statusPillText, { color: paletteEntry.color }]}
        >
          {label}
        </ThemedText>
      </View>
    );
  };

  const ActionButton = ({
    label,
    icon,
    tone = "primary",
    onPress,
    disabled = false,
  }: {
    label: string;
    icon: keyof typeof Feather.glyphMap;
    tone?: Tone;
    onPress: () => void;
    disabled?: boolean;
  }) => {
    const toneStyles: Record<
      Tone,
      { bg: string; color: string; borderColor: string }
    > = {
      primary: { bg: accent, color: "#0b1827", borderColor: accent },
      secondary: { bg: softSurface, color: textColor, borderColor: border },
      outline: { bg: "transparent", color: accent, borderColor: accent },
      danger: { bg: "#f43f5e", color: "#fff", borderColor: "#f43f5e" },
    };

    const paletteEntry = toneStyles[tone];

    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.actionButton,
          {
            backgroundColor: paletteEntry.bg,
            borderColor: paletteEntry.borderColor,
            opacity: disabled ? 0.5 : 1,
          },
          pressed && !disabled ? styles.actionButtonPressed : null,
        ]}
      >
        <Feather name={icon} size={16} color={paletteEntry.color} />
        <ThemedText style={[styles.actionLabel, { color: paletteEntry.color }]}>
          {label}
        </ThemedText>
      </Pressable>
    );
  };

  const StatCard = ({
    icon,
    label,
    value,
  }: {
    icon: keyof typeof Feather.glyphMap;
    label: string;
    value: string;
  }) => (
    <View
      style={[
        styles.statCard,
        { backgroundColor: softSurface, borderColor: border },
      ]}
    >
      <View style={[styles.iconChip, { backgroundColor: `${accent}1a` }]}>
        <Feather name={icon} size={16} color={accent} />
      </View>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
    </View>
  );

  return (
    <ScrollView
      style={{ padding: 26, paddingBottom: 16 }}
      contentContainerStyle={{ gap: 24 }}
    >
      <ThemedView style={styles.titleContainer}>
        <View>
          <ThemedText style={styles.overline}>Secure control</ThemedText>
          <ThemedText type="title" style={styles.pageTitle}>
            Device Control Hub
          </ThemedText>
        </View>
        <HelloWave />
      </ThemedView>

      <ThemedView
        style={[
          styles.heroCard,
          { backgroundColor: surface, borderColor: border },
        ]}
      >
        <View style={[styles.heroGlow, { backgroundColor: `${accent}24` }]} />
        <View style={[styles.heroGlow, styles.heroGlowAlt]} />
        <View style={styles.heroHeader}>
          <ThemedText style={styles.overline}>Android fleet posture</ThemedText>
          <StatusPill label={ownershipLabel} tone={ownershipTone} />
        </View>
        <ThemedText style={styles.heroTitle}>
          Confident single-app control and install governance
        </ThemedText>
        <ThemedText style={styles.heroSubtitle}>
          Set the device owner role, lock down kiosk mode, and keep installs in
          check with a calm, tactile console.
        </ThemedText>
        <View style={styles.heroStats}>
          <StatCard
            icon="shield"
            label="Ownership"
            value={
              isDeviceOwner === null
                ? "Checking..."
                : isDeviceOwner
                ? "Device owner ready"
                : "Needs device owner"
            }
          />
          <StatCard
            icon="smartphone"
            label="Platform"
            value={isAndroid ? "Android" : "Android features disabled"}
          />
        </View>
        <ThemedText style={styles.helperText}>
          {isAndroid
            ? "Device owner permissions are needed for kiosk mode and install blocks."
            : "Android-only controls are disabled on this platform."}
        </ThemedText>
      </ThemedView>

      <ThemedView
        style={[
          styles.sectionCard,
          { backgroundColor: softSurface, borderColor: border },
        ]}
      >
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={[styles.iconChip, { backgroundColor: `${accent}1a` }]}>
              <Feather name="download-cloud" size={16} color={accent} />
            </View>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Control app installs
            </ThemedText>
          </View>
          <StatusPill
            label={isAndroid ? "Android" : "Unsupported"}
            tone={isAndroid ? "info" : "warn"}
          />
        </View>
        <ThemedText style={styles.sectionCopy}>
          Restrict or allow other app installs on the device. Works only when
          this app is the device owner.
        </ThemedText>
        <View style={styles.actionRow}>
          <ActionButton
            label="Block installs"
            icon="slash"
            tone="danger"
            onPress={() => onToggleInstallBlock(true)}
            disabled={!isAndroid}
          />
          <ActionButton
            label="Allow installs"
            icon="check-circle"
            tone="secondary"
            onPress={() => onToggleInstallBlock(false)}
            disabled={!isAndroid}
          />
        </View>
        {installBlockResult && (
          <ThemedText style={styles.feedback}>{installBlockResult}</ThemedText>
        )}
      </ThemedView>

      <ThemedView
        style={[
          styles.sectionCard,
          { backgroundColor: softSurface, borderColor: border },
        ]}
      >
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={[styles.iconChip, { backgroundColor: `${accent}1a` }]}>
              <Feather name="lock" size={16} color={accent} />
            </View>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Single-app kiosk
            </ThemedText>
          </View>
          <StatusPill
            label={isAndroid ? "Device owner required" : "Android only"}
            tone={isAndroid ? "info" : "warn"}
          />
        </View>
        <ThemedText style={styles.sectionCopy}>
          Lock the experience to this app or free the device for normal use.
          Ideal for demos and dedicated terminals.
        </ThemedText>
        <View style={styles.actionRow}>
          <ActionButton
            label="Enable kiosk"
            icon="monitor"
            onPress={onEnableKiosk}
            tone="primary"
            disabled={!isAndroid}
          />
          <ActionButton
            label="Disable kiosk"
            icon="unlock"
            onPress={onDisableKiosk}
            tone="secondary"
            disabled={!isAndroid}
          />
        </View>
        {kioskMessage && (
          <ThemedText style={styles.feedback}>{kioskMessage}</ThemedText>
        )}
      </ThemedView>

      <ThemedView
        style={[
          styles.sectionCard,
          { backgroundColor: softSurface, borderColor: border },
        ]}
      >
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={[styles.iconChip, { backgroundColor: `${accent}1a` }]}>
              <Feather name="cpu" size={16} color={accent} />
            </View>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Device intelligence
            </ThemedText>
          </View>
          <StatusPill
            label={isAndroid ? "Ready" : "Android only"}
            tone={isAndroid ? "secondary" : "warn"}
          />
        </View>
        <ThemedText style={styles.sectionCopy}>
          Pull a structured snapshot of the device to verify ownership,
          restrictions, and hardware profile.
        </ThemedText>
        <ActionButton
          label="Get device info"
          icon="terminal"
          tone="outline"
          onPress={onFetchDeviceInfo}
          disabled={!isAndroid}
        />
        {deviceInfo && (
          <ScrollView
            style={[
              styles.deviceInfoContainer,
              { borderColor: border, backgroundColor: surface },
            ]}
            contentContainerStyle={styles.deviceInfoContent}
            nestedScrollEnabled
            showsVerticalScrollIndicator
          >
            {Object.entries(deviceInfo).map(([key, value]) => (
              <View key={key} style={styles.deviceInfoRow}>
                <ThemedText style={styles.deviceInfoKey}>{key}</ThemedText>
                <ThemedText style={styles.deviceInfoValue}>
                  {String(value)}
                </ThemedText>
              </View>
            ))}
          </ScrollView>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pageTitle: {
    fontSize: 30,
    letterSpacing: 0.4,
  },
  heroCard: {
    position: "relative",
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    overflow: "hidden",
    gap: 12,
  },
  heroGlow: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 160,
    opacity: 0.3,
    top: -60,
    right: -40,
  },
  heroGlowAlt: {
    left: -60,
    bottom: -120,
    backgroundColor: "#22c55e22",
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  heroSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.9,
  },
  heroStats: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  heroActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 4,
  },
  helperText: {
    opacity: 0.7,
    fontSize: 14,
  },
  overline: {
    fontSize: 13,
    letterSpacing: 1.1,
    textTransform: "uppercase",
    opacity: 0.7,
    fontWeight: "700",
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sectionTitle: {
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  sectionCopy: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.9,
  },
  iconChip: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  actionButton: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  actionButtonPressed: {
    transform: [{ translateY: 1 }],
    opacity: 0.9,
  },
  actionLabel: {
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 50,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 13,
    fontWeight: "700",
  },
  statCard: {
    flex: 1,
    minWidth: 160,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    gap: 6,
  },
  statLabel: {
    fontSize: 13,
    letterSpacing: 0.3,
    opacity: 0.7,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  feedback: {
    marginTop: 4,
    fontWeight: "600",
  },
  deviceInfoContainer: {
    maxHeight: 320,
    borderWidth: 1,
    borderRadius: 14,
    marginTop: 4,
  },
  deviceInfoContent: {
    gap: 8,
    padding: 12,
  },
  deviceInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  deviceInfoKey: {
    fontFamily: "monospace",
    fontWeight: "700",
    opacity: 0.8,
  },
  deviceInfoValue: {
    flex: 1,
    textAlign: "right",
    fontFamily: "monospace",
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
