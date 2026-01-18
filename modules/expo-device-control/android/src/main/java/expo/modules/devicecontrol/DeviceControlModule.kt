package expo.modules.devicecontrol

import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.os.UserManager
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

    Function("setInstallAppsBlocked") { blocked: Boolean ->
      val ctx = appContext.reactContext ?: return@Function false
      val dpm = ctx.getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
      val admin = ComponentName(ctx, DeviceControlAdminReceiver::class.java)
      val restrictions = listOf(
        UserManager.DISALLOW_INSTALL_APPS,
        UserManager.DISALLOW_INSTALL_UNKNOWN_SOURCES
      )

      return@Function try {
        restrictions.forEach { restriction ->
          if (blocked) {
            dpm.addUserRestriction(admin, restriction)
          } else {
            dpm.clearUserRestriction(admin, restriction)
          }
        }
        true
      } catch (_: SecurityException) {
        false
      }
    }

    Function("enableKioskMode") {
      val ctx = appContext.reactContext
        ?: throw IllegalStateException("React context unavailable; cannot enable kiosk mode.")
      val activity = appContext.currentActivity
        ?: throw IllegalStateException("Current activity unavailable; cannot start lock task mode.")
      val dpm = ctx.getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
      if (!dpm.isDeviceOwnerApp(ctx.packageName)) {
        throw SecurityException("App must be device owner to enable kiosk mode.")
      }

      val admin = ComponentName(ctx, DeviceControlAdminReceiver::class.java)
      dpm.setLockTaskPackages(admin, arrayOf(ctx.packageName))
      activity.startLockTask()
    }

    Function("disableKioskMode") {
      val activity = appContext.currentActivity
        ?: throw IllegalStateException("Current activity unavailable; cannot stop lock task mode.")
      activity.stopLockTask()
    }
  }
}
