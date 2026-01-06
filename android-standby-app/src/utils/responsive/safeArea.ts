import { Dimensions, Platform, StatusBar } from 'react-native';

export interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/**
 * Get estimated safe area insets for notches and curved screens
 * Note: For production, consider using react-native-safe-area-context
 */
export const getEstimatedSafeAreaInsets = (): SafeAreaInsets => {
  const { width, height } = Dimensions.get('window');
  const isLandscape = width > height;

  // Default insets
  const insets: SafeAreaInsets = {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  };

  if (Platform.OS === 'android') {
    // Status bar height
    insets.top = StatusBar.currentHeight || 24;

    // Estimate for notch/punch-hole cameras
    // Most modern Android phones with notches
    if (height > 800) {
      insets.top = Math.max(insets.top, 40);
    }

    // Navigation bar (gesture bar or buttons)
    if (height > 700) {
      insets.bottom = isLandscape ? 0 : 20; // Gesture bar height
    }

    // Foldable crease area (Samsung Z Fold)
    // Add padding when screen is very wide (unfolded state)
    if (width > 700) {
      insets.left = 8;
      insets.right = 8;
    }
  }

  return insets;
};

/**
 * Apply safe area padding to a value
 */
export const applySafeAreaTop = (value: number): number => {
  const insets = getEstimatedSafeAreaInsets();
  return value + insets.top;
};

export const applySafeAreaBottom = (value: number): number => {
  const insets = getEstimatedSafeAreaInsets();
  return value + insets.bottom;
};

export const applySafeAreaLeft = (value: number): number => {
  const insets = getEstimatedSafeAreaInsets();
  return value + insets.left;
};

export const applySafeAreaRight = (value: number): number => {
  const insets = getEstimatedSafeAreaInsets();
  return value + insets.right;
};

/**
 * Get usable screen dimensions (excluding safe areas)
 */
export const getUsableScreenDimensions = (): {
  width: number;
  height: number;
  usableWidth: number;
  usableHeight: number;
} => {
  const { width, height } = Dimensions.get('window');
  const insets = getEstimatedSafeAreaInsets();

  return {
    width,
    height,
    usableWidth: width - insets.left - insets.right,
    usableHeight: height - insets.top - insets.bottom,
  };
};

