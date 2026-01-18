package expo.modules.devicecontrol

import android.app.admin.DevicePolicyManager
import android.content.Context
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class DeviceControlModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("DeviceControl")

    Function("isDeviceOwner") {
      val ctx = appContext.reactContext ?: return@Function false
      val dpm = ctx.getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
      dpm.isDeviceOwnerApp(ctx.packageName)
    }
  }
}
