import { NativeModule, requireNativeModule } from 'expo';

import { ExpoDeviceControlModuleEvents } from './ExpoDeviceControl.types';

declare class ExpoDeviceControlModule extends NativeModule<ExpoDeviceControlModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoDeviceControlModule>('ExpoDeviceControl');
