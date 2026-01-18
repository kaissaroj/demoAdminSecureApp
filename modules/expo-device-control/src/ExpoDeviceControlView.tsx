import { requireNativeView } from 'expo';
import * as React from 'react';

import { ExpoDeviceControlViewProps } from './ExpoDeviceControl.types';

const NativeView: React.ComponentType<ExpoDeviceControlViewProps> =
  requireNativeView('ExpoDeviceControl');

export default function ExpoDeviceControlView(props: ExpoDeviceControlViewProps) {
  return <NativeView {...props} />;
}
