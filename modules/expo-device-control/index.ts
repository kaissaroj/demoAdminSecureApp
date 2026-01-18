// Reexport the native module. On web, it will be resolved to ExpoDeviceControlModule.web.ts
// and on native platforms to ExpoDeviceControlModule.ts
export { default } from './src/ExpoDeviceControlModule';
export { default as ExpoDeviceControlView } from './src/ExpoDeviceControlView';
export { default as DeviceControl } from './src/DeviceControlModule';
export * from './src/ExpoDeviceControl.types';
