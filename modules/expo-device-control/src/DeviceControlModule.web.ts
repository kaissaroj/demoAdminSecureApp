import { NativeModule, registerWebModule } from 'expo';

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
}

export default registerWebModule(DeviceControlModule);
