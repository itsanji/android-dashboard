import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Widget, WidgetType, WidgetPosition, BackgroundConfig } from '../types';
import StorageService from '../services/storage';
import { useScreenDimensions } from '../hooks/useScreenDimensions';
import { constrainPosition, getLayoutKey, scalePosition, snapWidgetToGrid } from '../utils/layout';

interface CanvasSize {
  width: number;
  height: number;
}

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
  setCanvasSize: (size: CanvasSize) => void;
  loadWidgets: () => Promise<void>;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

/** Set the widget's position in the active layout and remember it for that layout */
const withPosition = (widget: Widget, position: WidgetPosition, layoutKey?: string): Widget =>
  ({
    ...widget,
    position,
    layouts: layoutKey ? { ...widget.layouts, [layoutKey]: position } : widget.layouts,
  }) as Widget;

const getDefaultConfig = (type: WidgetType): Widget['config'] => {
  switch (type) {
    case WidgetType.CALENDAR:
      return { maxEvents: 3, showTime: true };
    case WidgetType.WEATHER:
      return { showForecast: false, units: 'celsius' };
    case WidgetType.MEDIA_CONTROLLER:
      return { showAlbumArt: true, compactMode: false };
    case WidgetType.CUSTOM_TEXT:
      return { text: 'Your text here', alignment: 'center' };
    case WidgetType.CLOCK:
      return { format: '24h', showDate: true, clockStyle: 'digital' };
  }
};

export const WidgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [background, setBackgroundState] = useState<BackgroundConfig>({
    type: 'color',
    color: '#121212',
  });
  // Persisting is disabled until stored data has been loaded, otherwise the
  // initial defaults would overwrite what is in storage.
  const [isHydrated, setIsHydrated] = useState(false);
  const screen = useScreenDimensions();
  const [canvasSize, setCanvasSizeState] = useState<CanvasSize | null>(null);
  // Layout (fold state + orientation) the widgets' `position` currently belongs to
  const activeLayoutRef = useRef<{ key: string; size: CanvasSize } | null>(null);

  // Widgets are laid out inside the canvas, which is smaller than the window
  // (safe area insets). Fall back to the window size until it is measured.
  const width = canvasSize?.width ?? screen.width;
  const height = canvasSize?.height ?? screen.height;

  const loadWidgets = useCallback(async () => {
    try {
      const [loadedWidgets, loadedBackground] = await Promise.all([
        StorageService.loadWidgets(),
        StorageService.loadBackground(),
      ]);

      if (loadedWidgets.length > 0) {
        // Older saves may lack a config
        setWidgets(
          loadedWidgets.map(
            (widget) =>
              ({ ...widget, config: widget.config ?? getDefaultConfig(widget.type) }) as Widget
          )
        );
      }

      if (loadedBackground) {
        setBackgroundState(loadedBackground);
      }
    } catch (error) {
      console.error('Error loading widgets:', error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Load widgets from storage on mount
  useEffect(() => {
    loadWidgets();
  }, [loadWidgets]);

  // When the canvas is measured or resized, switch every widget to its
  // position for the current layout. Leaving a layout (e.g. unfolding or
  // rotating) stores the positions under the old layout so they come back
  // unchanged when returning to it.
  useEffect(() => {
    if (!canvasSize || !isHydrated) return;

    const previous = activeLayoutRef.current;
    const key = getLayoutKey(canvasSize.width, canvasSize.height);
    activeLayoutRef.current = { key, size: canvasSize };

    setWidgets((prev) =>
      prev.map((widget) => {
        const layouts = { ...widget.layouts };
        let position: WidgetPosition;

        if (!previous) {
          // First measurement after loading: use the saved layout for this screen
          position = layouts[key] ?? widget.position;
        } else if (previous.key !== key) {
          layouts[previous.key] = widget.position;
          position = layouts[key] ?? scalePosition(widget.position, previous.size, canvasSize);
        } else {
          // Same layout, slightly different size
          position = widget.position;
        }

        const constrained = constrainPosition(position, canvasSize.width, canvasSize.height);
        return withPosition({ ...widget, layouts } as Widget, constrained, key);
      })
    );
  }, [canvasSize, isHydrated]);

  // Save widgets to storage whenever they change (including becoming empty)
  useEffect(() => {
    if (!isHydrated) return;
    StorageService.saveWidgets(widgets).catch(console.error);
  }, [widgets, isHydrated]);

  // Save background whenever it changes
  useEffect(() => {
    if (!isHydrated) return;
    StorageService.saveBackground(background).catch(console.error);
  }, [background, isHydrated]);

  const addWidget = useCallback(
    (type: WidgetType, initialPosition?: Partial<WidgetPosition>) => {
      const id = `widget_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

      // Default position: center of canvas
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

      setWidgets((prev) => {
        const maxZIndex = prev.reduce((max, w) => Math.max(max, w.zIndex || 0), 0);
        const newWidget = {
          id,
          type,
          position: constrainedPosition,
          layouts: activeLayoutRef.current
            ? { [activeLayoutRef.current.key]: constrainedPosition }
            : undefined,
          zIndex: maxZIndex + 1,
          config: getDefaultConfig(type),
          style: {
            backgroundColor: 'rgba(30, 30, 30, 0.9)',
            textColor: '#ffffff',
            borderRadius: 12,
            padding: 12,
          },
        } as Widget;
        return [...prev, newWidget];
      });
      setSelectedWidgetId(id);
    },
    [width, height]
  );

  const removeWidget = useCallback((id: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== id));
    setSelectedWidgetId((prev) => (prev === id ? null : prev));
  }, []);

  const updateWidgetPosition = useCallback(
    (id: string, position: WidgetPosition) => {
      setWidgets((prev) =>
        prev.map((widget) => {
          if (widget.id === id) {
            const snapped = snapWidgetToGrid(position);
            const constrained = constrainPosition(snapped, width, height);
            return withPosition(widget, constrained, activeLayoutRef.current?.key);
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
      const target = prev.find((w) => w.id === id);
      if (!target) return prev;
      const maxZIndex = prev.reduce((max, w) => Math.max(max, w.zIndex || 0), 0);
      const sharesTop = prev.some((w) => w.id !== id && (w.zIndex || 0) === maxZIndex);
      // Already on top: avoid a needless state change (and storage write)
      if ((target.zIndex || 0) === maxZIndex && !sharesTop) return prev;
      return prev.map((widget) =>
        widget.id === id ? { ...widget, zIndex: maxZIndex + 1 } : widget
      );
    });
  }, []);

  const setBackground = useCallback((newBackground: BackgroundConfig) => {
    setBackgroundState(newBackground);
  }, []);

  const setCanvasSize = useCallback((size: CanvasSize) => {
    setCanvasSizeState((prev) =>
      prev && prev.width === size.width && prev.height === size.height ? prev : size
    );
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
    setCanvasSize,
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
