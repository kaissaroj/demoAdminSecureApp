import { requireNativeModule } from 'expo';
import { Platform } from 'react-native';

type DeviceControlModule = {
  isDeviceOwner(): boolean;
  setInstallAppsBlocked(blocked: boolean): boolean;
};

// Loads the native module on Android; falls back to a noop on other platforms.
const DeviceControl: DeviceControlModule =
  Platform.OS === 'android'
    ? requireNativeModule<DeviceControlModule>('DeviceControl')
    : {
        isDeviceOwner: () => false,
        setInstallAppsBlocked: () => false,
      };

export default DeviceControl;
