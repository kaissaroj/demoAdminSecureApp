package expo.modules.devicecontrol

import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.BatteryManager
import android.os.Build
import android.os.StatFs
import android.os.UserManager
import android.provider.Settings
import android.view.WindowManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.net.Inet4Address
import kotlin.math.roundToInt

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

    Function("getDeviceInfo") {
      val ctx = appContext.reactContext ?: return@Function emptyMap<String, Any?>()
      val pm = ctx.packageManager
      val packageName = ctx.packageName
      val packageInfo = try {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
          pm.getPackageInfo(packageName, PackageManager.PackageInfoFlags.of(0))
        } else {
          @Suppress("DEPRECATION")
          pm.getPackageInfo(packageName, 0)
        }
      } catch (_: PackageManager.NameNotFoundException) {
        null
      }

      val connectivityManager = ctx.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
      val networkInfo = getNetworkInfo(connectivityManager)

      val displayMetrics = ctx.resources.displayMetrics
      val refreshRate = getRefreshRate()
      val storage = getStorageInfo(ctx)
      val battery = getBatteryInfo(ctx)

      return@Function mapOf(
        "manufacturer" to Build.MANUFACTURER,
        "brand" to Build.BRAND,
        "model" to Build.MODEL,
        "device" to Build.DEVICE,
        "product" to Build.PRODUCT,
        "hardware" to Build.HARDWARE,
        "board" to Build.BOARD,
        "androidVersion" to Build.VERSION.RELEASE,
        "sdkInt" to Build.VERSION.SDK_INT,
        "securityPatch" to getSecurityPatch(),
        "buildFingerprint" to Build.FINGERPRINT,
        "bootloader" to Build.BOOTLOADER,
        "packageName" to packageName,
        "appVersionName" to packageInfo?.versionName,
        "appVersionCode" to packageInfo?.let {
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            it.longVersionCode
          } else {
            @Suppress("DEPRECATION")
            it.versionCode.toLong()
          }
        },
        "androidId" to Settings.Secure.getString(ctx.contentResolver, Settings.Secure.ANDROID_ID),
        "ipAddress" to networkInfo.ipAddress,
        "networkType" to networkInfo.networkType,
        "isOnline" to networkInfo.isOnline,
        "screenWidthPx" to displayMetrics.widthPixels,
        "screenHeightPx" to displayMetrics.heightPixels,
        "screenDensity" to displayMetrics.density,
        "refreshRate" to refreshRate,
        "totalStorageMB" to storage.totalMb,
        "freeStorageMB" to storage.freeMb,
        "batteryPercent" to battery.levelPercent,
        "isCharging" to battery.isCharging,
        "chargingSource" to battery.chargingSource
      )
    }
  }

  private fun getSecurityPatch(): String? {
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      Build.VERSION.SECURITY_PATCH
    } else {
      null
    }
  }

  private data class NetworkDetails(
    val ipAddress: String?,
    val networkType: String,
    val isOnline: Boolean
  )

  private fun getNetworkInfo(connectivityManager: ConnectivityManager): NetworkDetails {
    val activeNetwork = connectivityManager.activeNetwork
    val capabilities = connectivityManager.getNetworkCapabilities(activeNetwork)

    val isWifi = capabilities?.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) == true
    val isCellular = capabilities?.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) == true
    val isOnline = capabilities?.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) == true

    val networkType = when {
      isWifi -> "WIFI"
      isCellular -> "MOBILE"
      else -> "NONE"
    }

    val linkProperties = activeNetwork?.let { connectivityManager.getLinkProperties(it) }
    val fallbackIp = linkProperties?.linkAddresses
      ?.firstOrNull { it.address is Inet4Address }
      ?.address
      ?.hostAddress

    return NetworkDetails(
      ipAddress = fallbackIp,
      networkType = networkType,
      isOnline = isOnline
    )
  }

  private data class StorageInfo(val totalMb: Long?, val freeMb: Long?)

  private fun getStorageInfo(ctx: Context): StorageInfo {
    return try {
      val stat = StatFs(ctx.filesDir.absolutePath)
      val totalMb = stat.totalBytes / (1024 * 1024)
      val freeMb = stat.availableBytes / (1024 * 1024)
      StorageInfo(totalMb, freeMb)
    } catch (_: Exception) {
      StorageInfo(null, null)
    }
  }

  private data class BatteryInfo(val levelPercent: Int?, val isCharging: Boolean?, val chargingSource: String?)

  private fun getBatteryInfo(ctx: Context): BatteryInfo {
    val intent = ctx.registerReceiver(null, IntentFilter(Intent.ACTION_BATTERY_CHANGED))
    val level = intent?.getIntExtra(BatteryManager.EXTRA_LEVEL, -1) ?: -1
    val scale = intent?.getIntExtra(BatteryManager.EXTRA_SCALE, -1) ?: -1

    val batteryPercent = if (level >= 0 && scale > 0) {
      ((level.toFloat() / scale.toFloat()) * 100).roundToInt()
    } else {
      null
    }

    val status = intent?.getIntExtra(BatteryManager.EXTRA_STATUS, -1) ?: -1
    val isCharging = when (status) {
      BatteryManager.BATTERY_STATUS_CHARGING, BatteryManager.BATTERY_STATUS_FULL -> true
      BatteryManager.BATTERY_STATUS_DISCHARGING, BatteryManager.BATTERY_STATUS_NOT_CHARGING, BatteryManager.BATTERY_STATUS_UNKNOWN -> false
      else -> null
    }

    val plugType = intent?.getIntExtra(BatteryManager.EXTRA_PLUGGED, -1) ?: -1
    val chargingSource = when (plugType) {
      BatteryManager.BATTERY_PLUGGED_USB -> "USB"
      BatteryManager.BATTERY_PLUGGED_AC -> "AC"
      BatteryManager.BATTERY_PLUGGED_WIRELESS -> "WIRELESS"
      -1 -> null
      else -> "UNKNOWN"
    }

    return BatteryInfo(batteryPercent, isCharging, chargingSource)
  }

  private fun getRefreshRate(): Double? {
    val activity = appContext.currentActivity
    return if (activity != null) {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
        activity.display?.refreshRate?.toDouble()
      } else {
        @Suppress("DEPRECATION")
        activity.windowManager.defaultDisplay?.refreshRate?.toDouble()
      }
    } else {
      null
    }
  }

}
