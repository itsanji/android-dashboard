/**
 * Navigation types for the app
 */

export type RootStackParamList = {
  Dashboard: undefined;
  Settings: undefined;
};

export type ScreenNames = keyof RootStackParamList;

