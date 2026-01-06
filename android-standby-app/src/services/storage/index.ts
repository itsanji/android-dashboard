import AsyncStorage from '@react-native-async-storage/async-storage';
import { Widget, BackgroundConfig, AppSettings } from '../../types';
import { STORAGE_KEYS } from '../../constants';

/**
 * Storage Service for persisting app data
 */
class StorageService {
  /**
   * Save widgets configuration
   */
  async saveWidgets(widgets: Widget[]): Promise<void> {
    try {
      const jsonValue = JSON.stringify(widgets);
      await AsyncStorage.setItem(STORAGE_KEYS.WIDGETS, jsonValue);
    } catch (error) {
      console.error('Error saving widgets:', error);
      throw error;
    }
  }

  /**
   * Load widgets configuration
   */
  async loadWidgets(): Promise<Widget[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.WIDGETS);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
      console.error('Error loading widgets:', error);
      return [];
    }
  }

  /**
   * Save background configuration
   */
  async saveBackground(background: BackgroundConfig): Promise<void> {
    try {
      const jsonValue = JSON.stringify(background);
      await AsyncStorage.setItem(STORAGE_KEYS.BACKGROUND, jsonValue);
    } catch (error) {
      console.error('Error saving background:', error);
      throw error;
    }
  }

  /**
   * Load background configuration
   */
  async loadBackground(): Promise<BackgroundConfig | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.BACKGROUND);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error loading background:', error);
      return null;
    }
  }

  /**
   * Save app settings
   */
  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      const jsonValue = JSON.stringify(settings);
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, jsonValue);
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  /**
   * Load app settings
   */
  async loadSettings(): Promise<AppSettings | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error loading settings:', error);
      return null;
    }
  }

  /**
   * Clear all stored data
   */
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.WIDGETS,
        STORAGE_KEYS.BACKGROUND,
        STORAGE_KEYS.SETTINGS,
      ]);
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  /**
   * Get storage info
   */
  async getStorageInfo(): Promise<{ keys: readonly string[]; size: number }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return { keys, size: keys.length };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return { keys: [], size: 0 };
    }
  }
}

export default new StorageService();

