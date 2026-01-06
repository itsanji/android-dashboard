// Widget Types
export enum WidgetType {
  CALENDAR = 'calendar',
  WEATHER = 'weather',
  MEDIA_CONTROLLER = 'media_controller',
  CUSTOM_TEXT = 'custom_text',
  CLOCK = 'clock',
}

export interface WidgetPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WidgetStyle {
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  borderRadius?: number;
  padding?: number;
  opacity?: number;
}

export interface BaseWidget {
  id: string;
  type: WidgetType;
  position: WidgetPosition;
  style?: WidgetStyle;
  zIndex?: number;
}

export interface CalendarWidget extends BaseWidget {
  type: WidgetType.CALENDAR;
  config: {
    maxEvents?: number;
    showTime?: boolean;
  };
}

export interface WeatherWidget extends BaseWidget {
  type: WidgetType.WEATHER;
  config: {
    showForecast?: boolean;
    units?: 'celsius' | 'fahrenheit';
  };
}

export interface MediaControllerWidget extends BaseWidget {
  type: WidgetType.MEDIA_CONTROLLER;
  config: {
    showAlbumArt?: boolean;
    compactMode?: boolean;
  };
}

export interface CustomTextWidget extends BaseWidget {
  type: WidgetType.CUSTOM_TEXT;
  config: {
    text: string;
    alignment?: 'left' | 'center' | 'right';
  };
}

export interface ClockWidget extends BaseWidget {
  type: WidgetType.CLOCK;
  config: {
    format?: '12h' | '24h';
    showDate?: boolean;
    clockStyle?: 'digital' | 'analog';
  };
}

export type Widget =
  | CalendarWidget
  | WeatherWidget
  | MediaControllerWidget
  | CustomTextWidget
  | ClockWidget;

// Background Types
export interface BackgroundConfig {
  type: 'image' | 'video' | 'color';
  uri?: string;
  color?: string;
}

// App Settings Types
export interface AppSettings {
  widgets: Widget[];
  background: BackgroundConfig;
  theme?: 'light' | 'dark' | 'auto';
}

// Screen Dimension Types
export enum ScreenSize {
  XS = 'xs', // < 360dp
  SM = 'sm', // 360-599dp
  MD = 'md', // 600-839dp
  LG = 'lg', // 840-1279dp
  XL = 'xl', // >= 1280dp
}

export interface ScreenDimensions {
  width: number;
  height: number;
  scale: number;
  fontScale: number;
  screenSize: ScreenSize;
  isPortrait: boolean;
  isTablet: boolean;
  isFoldable: boolean;
}

