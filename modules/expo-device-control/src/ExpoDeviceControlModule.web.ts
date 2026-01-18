import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './ExpoDeviceControl.types';

type ExpoDeviceControlModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class ExpoDeviceControlModule extends NativeModule<ExpoDeviceControlModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
};

export default registerWebModule(ExpoDeviceControlModule, 'ExpoDeviceControlModule');
