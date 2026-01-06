import { WidgetPosition } from '../../types';
import { WIDGET_CONSTRAINTS } from '../../constants/theme';

/**
 * Snap position to grid
 */
export const snapToGrid = (value: number, gridSize: number = WIDGET_CONSTRAINTS.gridSize): number => {
  return Math.round(value / gridSize) * gridSize;
};

/**
 * Snap widget position to grid
 */
export const snapWidgetToGrid = (position: WidgetPosition): WidgetPosition => {
  const gridSize = WIDGET_CONSTRAINTS.gridSize;
  return {
    x: snapToGrid(position.x, gridSize),
    y: snapToGrid(position.y, gridSize),
    width: Math.max(snapToGrid(position.width, gridSize), WIDGET_CONSTRAINTS.minWidth),
    height: Math.max(snapToGrid(position.height, gridSize), WIDGET_CONSTRAINTS.minHeight),
  };
};

/**
 * Constrain widget position within screen bounds
 */
export const constrainPosition = (
  position: WidgetPosition,
  screenWidth: number,
  screenHeight: number
): WidgetPosition => {
  return {
    x: Math.max(0, Math.min(position.x, screenWidth - position.width)),
    y: Math.max(0, Math.min(position.y, screenHeight - position.height)),
    width: Math.min(position.width, screenWidth, WIDGET_CONSTRAINTS.maxWidth),
    height: Math.min(position.height, screenHeight, WIDGET_CONSTRAINTS.maxHeight),
  };
};

/**
 * Check if two widgets overlap
 */
export const doWidgetsOverlap = (widget1: WidgetPosition, widget2: WidgetPosition): boolean => {
  return !(
    widget1.x + widget1.width <= widget2.x ||
    widget2.x + widget2.width <= widget1.x ||
    widget1.y + widget1.height <= widget2.y ||
    widget2.y + widget2.height <= widget1.y
  );
};

/**
 * Get optimal grid layout for widgets
 */
export const calculateGridLayout = (
  widgetCount: number,
  screenWidth: number,
  screenHeight: number,
  columns?: number
): { columns: number; rows: number; cellWidth: number; cellHeight: number } => {
  // Auto-calculate columns based on screen width if not provided
  const cols = columns || Math.floor(screenWidth / (WIDGET_CONSTRAINTS.minWidth + 16));
  const rows = Math.ceil(widgetCount / cols);
  
  const cellWidth = Math.floor(screenWidth / cols);
  const cellHeight = Math.floor(screenHeight / rows);

  return {
    columns: Math.max(1, cols),
    rows: Math.max(1, rows),
    cellWidth,
    cellHeight,
  };
};

/**
 * Reflow widgets to fit new screen dimensions
 */
export const reflowWidgets = (
  widgets: Array<{ id: string; position: WidgetPosition }>,
  oldWidth: number,
  oldHeight: number,
  newWidth: number,
  newHeight: number
): Array<{ id: string; position: WidgetPosition }> => {
  const scaleX = newWidth / oldWidth;
  const scaleY = newHeight / oldHeight;

  return widgets.map((widget) => {
    const newPosition: WidgetPosition = {
      x: widget.position.x * scaleX,
      y: widget.position.y * scaleY,
      width: widget.position.width * scaleX,
      height: widget.position.height * scaleY,
    };

    // Snap to grid and constrain within bounds
    const snapped = snapWidgetToGrid(newPosition);
    return {
      ...widget,
      position: constrainPosition(snapped, newWidth, newHeight),
    };
  });
};

/**
 * Auto-arrange widgets in a grid
 */
export const autoArrangeWidgets = (
  widgetIds: string[],
  screenWidth: number,
  screenHeight: number
): Record<string, WidgetPosition> => {
  const layout = calculateGridLayout(widgetIds.length, screenWidth, screenHeight);
  const positions: Record<string, WidgetPosition> = {};

  widgetIds.forEach((id, index) => {
    const col = index % layout.columns;
    const row = Math.floor(index / layout.columns);

    positions[id] = {
      x: col * layout.cellWidth,
      y: row * layout.cellHeight,
      width: Math.min(layout.cellWidth - 16, WIDGET_CONSTRAINTS.maxWidth),
      height: Math.min(layout.cellHeight - 16, WIDGET_CONSTRAINTS.maxHeight),
    };
  });

  return positions;
};

