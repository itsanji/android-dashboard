import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Widget, WidgetType, WidgetPosition, BackgroundConfig } from '../types';
import StorageService from '../services/storage';
import { useScreenDimensions } from '../hooks/useScreenDimensions';
import { constrainPosition, snapWidgetToGrid } from '../utils/layout';

interface WidgetContextType {
  widgets: Widget[];
  selectedWidgetId: string | null;
  background: BackgroundConfig;
  addWidget: (type: WidgetType, initialPosition?: Partial<WidgetPosition>) => void;
  removeWidget: (id: string) => void;
  updateWidgetPosition: (id: string, position: WidgetPosition) => void;
  updateWidgetStyle: (id: string, style: Partial<Widget['style']>) => void;
  selectWidget: (id: string | null) => void;
  bringToFront: (id: string) => void;
  setBackground: (background: BackgroundConfig) => void;
  loadWidgets: () => Promise<void>;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

export const WidgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [background, setBackgroundState] = useState<BackgroundConfig>({
    type: 'color',
    color: '#121212',
  });
  const { width, height } = useScreenDimensions();

  // Load widgets from storage on mount
  useEffect(() => {
    loadWidgets();
  }, []);

  const loadWidgets = useCallback(async () => {
    try {
      const loadedWidgets = await StorageService.loadWidgets();
      const loadedBackground = await StorageService.loadBackground();
      
      if (loadedWidgets.length > 0) {
        // Constrain widgets to current screen bounds
        const constrainedWidgets = loadedWidgets.map((widget) => ({
          ...widget,
          position: constrainPosition(widget.position, width, height),
        }));
        setWidgets(constrainedWidgets);
      }
      
      if (loadedBackground) {
        setBackgroundState(loadedBackground);
      }
    } catch (error) {
      console.error('Error loading widgets:', error);
    }
  }, [width, height]);

  // Save widgets to storage whenever they change
  useEffect(() => {
    if (widgets.length > 0) {
      StorageService.saveWidgets(widgets).catch(console.error);
    }
  }, [widgets]);

  // Save background whenever it changes
  useEffect(() => {
    StorageService.saveBackground(background).catch(console.error);
  }, [background]);

  const addWidget = useCallback(
    (type: WidgetType, initialPosition?: Partial<WidgetPosition>) => {
      const id = `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Default position: center of screen
      const defaultPosition: WidgetPosition = {
        x: (width - 200) / 2,
        y: (height - 200) / 2,
        width: 200,
        height: 200,
      };

      const position = {
        ...defaultPosition,
        ...initialPosition,
      };

      // Snap to grid and constrain
      const snappedPosition = snapWidgetToGrid(position);
      const constrainedPosition = constrainPosition(snappedPosition, width, height);

      // Get highest z-index
      const maxZIndex = widgets.reduce((max, w) => Math.max(max, w.zIndex || 0), 0);

      const newWidget: Widget = {
        id,
        type,
        position: constrainedPosition,
        zIndex: maxZIndex + 1,
        style: {
          backgroundColor: 'rgba(30, 30, 30, 0.9)',
          textColor: '#ffffff',
          borderRadius: 12,
          padding: 12,
        },
      } as Widget;

      setWidgets((prev) => [...prev, newWidget]);
      setSelectedWidgetId(id);
    },
    [widgets, width, height]
  );

  const removeWidget = useCallback((id: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== id));
    if (selectedWidgetId === id) {
      setSelectedWidgetId(null);
    }
  }, [selectedWidgetId]);

  const updateWidgetPosition = useCallback(
    (id: string, position: WidgetPosition) => {
      setWidgets((prev) =>
        prev.map((widget) => {
          if (widget.id === id) {
            const snapped = snapWidgetToGrid(position);
            const constrained = constrainPosition(snapped, width, height);
            return { ...widget, position: constrained };
          }
          return widget;
        })
      );
    },
    [width, height]
  );

  const updateWidgetStyle = useCallback((id: string, style: Partial<Widget['style']>) => {
    setWidgets((prev) =>
      prev.map((widget) =>
        widget.id === id ? { ...widget, style: { ...widget.style, ...style } } : widget
      )
    );
  }, []);

  const selectWidget = useCallback((id: string | null) => {
    setSelectedWidgetId(id);
  }, []);

  const bringToFront = useCallback((id: string) => {
    setWidgets((prev) => {
      const maxZIndex = prev.reduce((max, w) => Math.max(max, w.zIndex || 0), 0);
      return prev.map((widget) =>
        widget.id === id ? { ...widget, zIndex: maxZIndex + 1 } : widget
      );
    });
  }, []);

  const setBackground = useCallback((newBackground: BackgroundConfig) => {
    setBackgroundState(newBackground);
  }, []);

  const value: WidgetContextType = {
    widgets,
    selectedWidgetId,
    background,
    addWidget,
    removeWidget,
    updateWidgetPosition,
    updateWidgetStyle,
    selectWidget,
    bringToFront,
    setBackground,
    loadWidgets,
  };

  return <WidgetContext.Provider value={value}>{children}</WidgetContext.Provider>;
};

export const useWidgets = (): WidgetContextType => {
  const context = useContext(WidgetContext);
  if (!context) {
    throw new Error('useWidgets must be used within a WidgetProvider');
  }
  return context;
};

