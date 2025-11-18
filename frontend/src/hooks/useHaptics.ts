import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'

/**
 * Custom hook for haptic feedback
 * Works on iOS and Android via Capacitor
 */
export const useHaptics = () => {
  const impact = async (style: 'light' | 'medium' | 'heavy' = 'medium') => {
    try {
      const styleMap = {
        light: ImpactStyle.Light,
        medium: ImpactStyle.Medium,
        heavy: ImpactStyle.Heavy,
      }
      await Haptics.impact({ style: styleMap[style] })
    } catch (error) {
      // Haptics not available (web browser)
      console.debug('Haptics not available')
    }
  }

  const notification = async (type: 'success' | 'warning' | 'error' = 'success') => {
    try {
      const typeMap = {
        success: NotificationType.Success,
        warning: NotificationType.Warning,
        error: NotificationType.Error,
      }
      await Haptics.notification({ type: typeMap[type] })
    } catch (error) {
      console.debug('Haptics not available')
    }
  }

  const vibrate = async (duration: number = 100) => {
    try {
      await Haptics.vibrate({ duration })
    } catch (error) {
      console.debug('Haptics not available')
    }
  }

  const selectionStart = async () => {
    try {
      await Haptics.selectionStart()
    } catch (error) {
      console.debug('Haptics not available')
    }
  }

  const selectionChanged = async () => {
    try {
      await Haptics.selectionChanged()
    } catch (error) {
      console.debug('Haptics not available')
    }
  }

  const selectionEnd = async () => {
    try {
      await Haptics.selectionEnd()
    } catch (error) {
      console.debug('Haptics not available')
    }
  }

  return {
    impact,
    notification,
    vibrate,
    selectionStart,
    selectionChanged,
    selectionEnd,
  }
}
