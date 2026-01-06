import * as Calendar from 'expo-calendar';
import * as MediaLibrary from 'expo-media-library';
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import { PERMISSION_MESSAGES } from '../../constants';

export interface PermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
}

/**
 * Request calendar permissions
 */
export const requestCalendarPermissions = async (): Promise<PermissionStatus> => {
  try {
    const { status, canAskAgain } = await Calendar.requestCalendarPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', PERMISSION_MESSAGES.CALENDAR);
    }
    
    return {
      granted: status === 'granted',
      canAskAgain,
    };
  } catch (error) {
    console.error('Error requesting calendar permissions:', error);
    return { granted: false, canAskAgain: false };
  }
};

/**
 * Request media library permissions
 */
export const requestMediaPermissions = async (): Promise<PermissionStatus> => {
  try {
    const { status, canAskAgain } = await MediaLibrary.requestPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', PERMISSION_MESSAGES.MEDIA);
    }
    
    return {
      granted: status === 'granted',
      canAskAgain,
    };
  } catch (error) {
    console.error('Error requesting media permissions:', error);
    return { granted: false, canAskAgain: false };
  }
};

/**
 * Request location permissions
 */
export const requestLocationPermissions = async (): Promise<PermissionStatus> => {
  try {
    const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', PERMISSION_MESSAGES.LOCATION);
    }
    
    return {
      granted: status === 'granted',
      canAskAgain,
    };
  } catch (error) {
    console.error('Error requesting location permissions:', error);
    return { granted: false, canAskAgain: false };
  }
};

/**
 * Check if calendar permissions are granted
 */
export const hasCalendarPermissions = async (): Promise<boolean> => {
  try {
    const { status } = await Calendar.getCalendarPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking calendar permissions:', error);
    return false;
  }
};

/**
 * Check if media permissions are granted
 */
export const hasMediaPermissions = async (): Promise<boolean> => {
  try {
    const { status } = await MediaLibrary.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking media permissions:', error);
    return false;
  }
};

/**
 * Check if location permissions are granted
 */
export const hasLocationPermissions = async (): Promise<boolean> => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking location permissions:', error);
    return false;
  }
};

/**
 * Request all necessary permissions at once
 */
export const requestAllPermissions = async (): Promise<{
  calendar: boolean;
  media: boolean;
  location: boolean;
}> => {
  const [calendar, media, location] = await Promise.all([
    requestCalendarPermissions(),
    requestMediaPermissions(),
    requestLocationPermissions(),
  ]);

  return {
    calendar: calendar.granted,
    media: media.granted,
    location: location.granted,
  };
};

