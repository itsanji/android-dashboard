// Main responsive utilities
import { Dimensions, PixelRatio, Platform } from 'react-native';
import { ScreenSize } from '../../types';
import { BREAKPOINTS } from '../../constants/theme';

/**
 * Get current screen dimensions
 */
export const getScreenDimensions = () => {
  const { width, height } = Dimensions.get('window');
  const scale = PixelRatio.get();
  const fontScale = PixelRatio.getFontScale();

  return {
    width,
    height,
    scale,
    fontScale,
  };
};

/**
 * Determine screen size category based on width
 */
export const getScreenSize = (width: number): ScreenSize => {
  if (width < BREAKPOINTS.sm) return ScreenSize.XS;
  if (width < BREAKPOINTS.md) return ScreenSize.SM;
  if (width < BREAKPOINTS.lg) return ScreenSize.MD;
  if (width < BREAKPOINTS.xl) return ScreenSize.LG;
  return ScreenSize.XL;
};

/**
 * Check if device is a tablet
 */
export const isTablet = (width: number, height: number): boolean => {
  const minDimension = Math.min(width, height);
  return minDimension >= BREAKPOINTS.md;
};

/**
 * Check if device is potentially a foldable
 */
export const isFoldable = (width: number, height: number): boolean => {
  const aspectRatio = Math.max(width, height) / Math.min(width, height);
  // Foldables typically have unusual aspect ratios when unfolded
  return aspectRatio > 2.5 || (width > 700 && height > 700);
};

/**
 * Check if screen is in portrait orientation
 */
export const isPortrait = (width: number, height: number): boolean => {
  return height > width;
};

/**
 * Scale value based on screen width
 */
export const scale = (size: number, baseWidth: number = 375): number => {
  const { width } = getScreenDimensions();
  return (width / baseWidth) * size;
};

/**
 * Scale font size with limits
 */
export const scaleFont = (size: number, maxScale: number = 1.3): number => {
  const { fontScale } = getScreenDimensions();
  const scaledSize = size * fontScale;
  return Math.min(scaledSize, size * maxScale);
};

/**
 * Normalize size for different screen densities
 */
export const normalize = (size: number): number => {
  const { scale: pixelRatio } = getScreenDimensions();
  
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(size));
  }
  
  // Android normalization based on density
  if (pixelRatio >= 3) {
    return size * 1.15;
  } else if (pixelRatio >= 2) {
    return size;
  }
  return size * 0.85;
};

/**
 * Get responsive spacing
 */
export const getResponsiveSpacing = (baseSpacing: number, screenSize: ScreenSize): number => {
  const multipliers: Record<ScreenSize, number> = {
    [ScreenSize.XS]: 0.8,
    [ScreenSize.SM]: 1,
    [ScreenSize.MD]: 1.2,
    [ScreenSize.LG]: 1.4,
    [ScreenSize.XL]: 1.6,
  };
  
  return baseSpacing * multipliers[screenSize];
};

/**
 * Get number of columns for grid layout
 */
export const getGridColumns = (width: number): number => {
  const screenSize = getScreenSize(width);
  
  const columns: Record<ScreenSize, number> = {
    [ScreenSize.XS]: 2,
    [ScreenSize.SM]: 3,
    [ScreenSize.MD]: 4,
    [ScreenSize.LG]: 5,
    [ScreenSize.XL]: 6,
  };
  
  return columns[screenSize];
};

/**
 * Calculate optimal widget size based on screen
 */
export const getOptimalWidgetSize = (
  width: number,
  height: number,
  widgetCount: number
): { width: number; height: number } => {
  const screenSize = getScreenSize(width);
  const cols = getGridColumns(width);
  const rows = Math.ceil(widgetCount / cols);
  
  const widgetWidth = width / cols;
  const widgetHeight = height / rows;
  
  return {
    width: Math.max(widgetWidth, 100),
    height: Math.max(widgetHeight, 100),
  };
};

// Re-export safe area utilities
export * from './safeArea';
