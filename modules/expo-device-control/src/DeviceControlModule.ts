import { requireNativeModule } from 'expo';
import { Platform } from 'react-native';

type DeviceControlModule = {
  isDeviceOwner(): boolean;
  setInstallAppsBlocked(blocked: boolean): boolean;
  enableKioskMode(): void;
  disableKioskMode(): void;
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
      };

export default DeviceControl;
