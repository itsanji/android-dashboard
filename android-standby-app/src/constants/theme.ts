export const COLORS = {
  primary: '#6200ee',
  primaryVariant: '#3700b3',
  secondary: '#03dac6',
  secondaryVariant: '#018786',
  background: '#121212',
  surface: '#1e1e1e',
  error: '#cf6679',
  onPrimary: '#ffffff',
  onSecondary: '#000000',
  onBackground: '#ffffff',
  onSurface: '#ffffff',
  onError: '#000000',
  
  // Additional colors
  text: {
    primary: '#ffffff',
    secondary: '#b3b3b3',
    disabled: '#666666',
  },
  divider: '#333333',
  border: '#444444',
  
  // Widget colors
  widgetBackground: 'rgba(30, 30, 30, 0.9)',
  widgetBorder: 'rgba(255, 255, 255, 0.1)',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const TYPOGRAPHY = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body1: {
    fontSize: 16,
    fontWeight: 'normal' as const,
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    fontWeight: 'normal' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: 'normal' as const,
    lineHeight: 16,
  },
};

export const BREAKPOINTS = {
  xs: 0,
  sm: 360,
  md: 600,
  lg: 840,
  xl: 1280,
};

export const WIDGET_CONSTRAINTS = {
  minWidth: 100,
  minHeight: 100,
  maxWidth: 800,
  maxHeight: 600,
  gridSize: 8, // Snap-to-grid size in pixels
};

export const ANIMATION = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    default: 'ease-in-out',
    spring: 'spring',
  },
};

export const TOUCH_TARGET_SIZE = 48; // Minimum touch target size in dp

