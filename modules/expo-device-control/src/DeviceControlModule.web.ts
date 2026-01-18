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
}

export default registerWebModule(DeviceControlModule);
