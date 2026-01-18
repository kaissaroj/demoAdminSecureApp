import * as React from 'react';

import { ExpoDeviceControlViewProps } from './ExpoDeviceControl.types';

export default function ExpoDeviceControlView(props: ExpoDeviceControlViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
