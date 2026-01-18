import { NativeModule, registerWebModule } from 'expo';

import type { DeviceInfo } from './DeviceControlModule';

const defaultDeviceInfo: DeviceInfo = {
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

class DeviceControlModule extends NativeModule {
  static override moduleName = 'DeviceControl';

  // Web fallback; native-only feature.
  isDeviceOwner(): boolean {
    return false;
  }

  setInstallAppsBlocked(): boolean {
    return false;
  }

  enableKioskMode(): void {
    throw new Error('Kiosk mode is only available on Android.');
  }

  disableKioskMode(): void {
    // no-op
  }

  getDeviceInfo(): DeviceInfo {
    return defaultDeviceInfo;
  }
}

export default registerWebModule(DeviceControlModule);
