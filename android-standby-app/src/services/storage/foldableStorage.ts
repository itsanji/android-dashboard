import AsyncStorage from '@react-native-async-storage/async-storage';
import { Widget, WidgetPosition } from '../../types';

const FOLD_LAYOUT_KEY = '@android_standby/fold_layouts';

export interface FoldableLayout {
  folded: Record<string, WidgetPosition>;
  unfolded: Record<string, WidgetPosition>;
}

/**
 * Service for managing separate layouts for folded/unfolded states
 */
class FoldableStorageService {
  /**
   * Save layout for specific fold state
   */
  async saveFoldLayout(
    deviceId: string,
    foldState: 'folded' | 'unfolded',
    widgetPositions: Record<string, WidgetPosition>
  ): Promise<void> {
    try {
      const key = `${FOLD_LAYOUT_KEY}_${deviceId}`;
      const existing = await this.loadFoldLayout(deviceId);

      const updated: FoldableLayout = {
        ...existing,
        [foldState]: widgetPositions,
      };

      await AsyncStorage.setItem(key, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving fold layout:', error);
      throw error;
    }
  }

  /**
   * Load layouts for both fold states
   */
  async loadFoldLayout(deviceId: string): Promise<FoldableLayout> {
    try {
      const key = `${FOLD_LAYOUT_KEY}_${deviceId}`;
      const jsonValue = await AsyncStorage.getItem(key);

      if (jsonValue) {
        return JSON.parse(jsonValue);
      }

      return {
        folded: {},
        unfolded: {},
      };
    } catch (error) {
      console.error('Error loading fold layout:', error);
      return {
        folded: {},
        unfolded: {},
      };
    }
  }

  /**
   * Get layout for current fold state
   */
  async getCurrentFoldLayout(
    deviceId: string,
    currentState: 'folded' | 'unfolded'
  ): Promise<Record<string, WidgetPosition>> {
    try {
      const layouts = await this.loadFoldLayout(deviceId);
      return layouts[currentState] || {};
    } catch (error) {
      console.error('Error getting current fold layout:', error);
      return {};
    }
  }

  /**
   * Clear all fold layouts
   */
  async clearFoldLayouts(deviceId: string): Promise<void> {
    try {
      const key = `${FOLD_LAYOUT_KEY}_${deviceId}`;
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error clearing fold layouts:', error);
      throw error;
    }
  }

  /**
   * Check if fold-specific layouts exist
   */
  async hasFoldLayouts(deviceId: string): Promise<boolean> {
    try {
      const layouts = await this.loadFoldLayout(deviceId);
      return Object.keys(layouts.folded).length > 0 || Object.keys(layouts.unfolded).length > 0;
    } catch (error) {
      console.error('Error checking fold layouts:', error);
      return false;
    }
  }

  /**
   * Apply widgets to specific fold state layout
   */
  async applyWidgetsToFoldState(
    deviceId: string,
    widgets: Widget[],
    foldState: 'folded' | 'unfolded'
  ): Promise<Widget[]> {
    try {
      const positions = await this.getCurrentFoldLayout(deviceId, foldState);

      return widgets.map((widget) => {
        const savedPosition = positions[widget.id];
        if (savedPosition) {
          return {
            ...widget,
            position: savedPosition,
          };
        }
        return widget;
      });
    } catch (error) {
      console.error('Error applying widgets to fold state:', error);
      return widgets;
    }
  }
}

export default new FoldableStorageService();

