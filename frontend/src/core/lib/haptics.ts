import { Vibration, Platform } from 'react-native';

/**
 * Haptic feedback helper.
 * Uses Vibration API as a fallback if expo-haptics is not available.
 * Note: For a truly 'premium' feel, 'expo-haptics' is recommended.
 */
export const hapticFeedback = {
  light: () => {
    if (Platform.OS !== 'web') {
      Vibration.vibrate(10);
    }
  },
  medium: () => {
    if (Platform.OS !== 'web') {
      Vibration.vibrate(20);
    }
  },
  success: () => {
    if (Platform.OS !== 'web') {
      Vibration.vibrate([0, 10, 50, 10]);
    }
  },
  error: () => {
    if (Platform.OS !== 'web') {
      Vibration.vibrate([0, 50, 100, 50]);
    }
  }
};
