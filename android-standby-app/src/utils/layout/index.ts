import { WidgetPosition } from '../../types';
import { WIDGET_CONSTRAINTS } from '../../constants/theme';
import { getFoldMode } from '../responsive';

/**
 * Snap position to grid
 */
export const snapToGrid = (
  value: number,
  gridSize: number = WIDGET_CONSTRAINTS.gridSize
): number => {
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
  // Clamp size first so the position is computed against the final size
  const width = Math.min(position.width, screenWidth, WIDGET_CONSTRAINTS.maxWidth);
  const height = Math.min(position.height, screenHeight, WIDGET_CONSTRAINTS.maxHeight);
  return {
    x: Math.max(0, Math.min(position.x, screenWidth - width)),
    y: Math.max(0, Math.min(position.y, screenHeight - height)),
    width,
    height,
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
  // Clamp to at least 1 before dividing to avoid Infinity/NaN cells
  const cols = Math.max(1, columns || Math.floor(screenWidth / (WIDGET_CONSTRAINTS.minWidth + 16)));
  const rows = Math.max(1, Math.ceil(widgetCount / cols));

  const cellWidth = Math.floor(screenWidth / cols);
  const cellHeight = Math.floor(screenHeight / rows);

  return {
    columns: cols,
    rows,
    cellWidth,
    cellHeight,
  };
};

/**
 * Identifies a distinct screen configuration (fold state + orientation).
 * Widgets keep a separate position for each one.
 */
export const getLayoutKey = (width: number, height: number): string =>
  `${getFoldMode(width, height)}-${width > height ? 'landscape' : 'portrait'}`;

/**
 * Map a widget position from one canvas size to another. The widget keeps its
 * aspect ratio and its center stays at the same relative spot on the canvas.
 */
export const scalePosition = (
  position: WidgetPosition,
  from: { width: number; height: number },
  to: { width: number; height: number }
): WidgetPosition => {
  const scaleX = to.width / from.width;
  const scaleY = to.height / from.height;
  const sizeScale = Math.min(scaleX, scaleY);

  const width = position.width * sizeScale;
  const height = position.height * sizeScale;
  const centerX = (position.x + position.width / 2) * scaleX;
  const centerY = (position.y + position.height / 2) * scaleY;

  const snapped = snapWidgetToGrid({
    x: centerX - width / 2,
    y: centerY - height / 2,
    width,
    height,
  });
  return constrainPosition(snapped, to.width, to.height);
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
): Array<{ id: string; position: WidgetPosition }> =>
  widgets.map((widget) => ({
    ...widget,
    position: scalePosition(
      widget.position,
      { width: oldWidth, height: oldHeight },
      { width: newWidth, height: newHeight }
    ),
  }));

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
