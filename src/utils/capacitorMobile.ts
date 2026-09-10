import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App as CapApp } from '@capacitor/app';

/**
 * Initializes native mobile APK settings (Status Bar, Hardware Back Button)
 * Safe to run both in Web Browser and Android APK.
 */
export async function initCapacitorMobileApp(onHardwareBack?: () => boolean): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // Configure native status bar to match Patel CCTV header theme
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#0f172a' });
  } catch (err) {
    console.debug('StatusBar styling not supported on this platform', err);
  }

  try {
    // Listen to Android hardware back button
    CapApp.addListener('backButton', ({ canGoBack }) => {
      // If consumer hook handled closing a modal, don't exit app
      if (onHardwareBack && onHardwareBack()) {
        return;
      }

      if (canGoBack) {
        window.history.back();
      } else {
        CapApp.exitApp();
      }
    });
  } catch (err) {
    console.debug('Capacitor BackButton not supported on this platform', err);
  }
}

export function isNativeAndroidApp(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
}
