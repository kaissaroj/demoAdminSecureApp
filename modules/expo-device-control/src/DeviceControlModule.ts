import { requireNativeModule } from 'expo';
import { Platform } from 'react-native';

export type DeviceInfo = {
  manufacturer: string | null;
  brand: string | null;
  model: string | null;
  device: string | null;
  product: string | null;
  hardware: string | null;
  board: string | null;
  androidVersion: string | null;
  sdkInt: number | null;
  securityPatch: string | null;
  buildFingerprint: string | null;
  bootloader: string | null;
  packageName: string | null;
  appVersionName: string | null;
  appVersionCode: number | null;
  androidId: string | null;
  ipAddress: string | null;
  networkType: 'WIFI' | 'MOBILE' | 'NONE' | null;
  isOnline: boolean | null;
  screenWidthPx: number | null;
  screenHeightPx: number | null;
  screenDensity: number | null;
  refreshRate: number | null;
  totalStorageMB: number | null;
  freeStorageMB: number | null;
  batteryPercent: number | null;
  isCharging: boolean | null;
  chargingSource: 'USB' | 'AC' | 'WIRELESS' | 'UNKNOWN' | null;
};

export const defaultDeviceInfo: DeviceInfo = {
  manufacturer: null,
  brand: null,
  model: null,
  device: null,
  product: null,
  hardware: null,
  board: null,
  androidVersion: null,
  sdkInt: null,
  securityPatch: null,
  buildFingerprint: null,
  bootloader: null,
  packageName: null,
  appVersionName: null,
  appVersionCode: null,
  androidId: null,
  ipAddress: null,
  networkType: null,
  isOnline: null,
  screenWidthPx: null,
  screenHeightPx: null,
  screenDensity: null,
  refreshRate: null,
  totalStorageMB: null,
  freeStorageMB: null,
  batteryPercent: null,
  isCharging: null,
  chargingSource: null,
};

type DeviceControlModule = {
  isDeviceOwner(): boolean;
  setInstallAppsBlocked(blocked: boolean): boolean;
  enableKioskMode(): void;
  disableKioskMode(): void;
  getDeviceInfo(): DeviceInfo;
};

// Loads the native module on Android; falls back to a noop on other platforms.
const DeviceControl: DeviceControlModule =
  Platform.OS === 'android'
    ? requireNativeModule<DeviceControlModule>('DeviceControl')
    : {
        isDeviceOwner: () => false,
        setInstallAppsBlocked: () => false,
        enableKioskMode: () => {
          throw new Error('Kiosk mode is only available on Android.');
        },
        disableKioskMode: () => {},
        getDeviceInfo: () => defaultDeviceInfo,
      };

export default DeviceControl;
