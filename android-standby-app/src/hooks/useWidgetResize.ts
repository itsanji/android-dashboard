import { useState, useCallback } from 'react';
import { GestureResponderEvent } from 'react-native';
import { WidgetPosition } from '../types';
import { snapWidgetToGrid, constrainPosition } from '../utils/layout';
import { WIDGET_CONSTRAINTS } from '../constants/theme';

interface ResizeState {
  isResizing: boolean;
  initialWidth: number;
  initialHeight: number;
  initialX: number;
  initialY: number;
}

export const useWidgetResize = (
  initialPosition: WidgetPosition,
  screenWidth: number,
  screenHeight: number,
  onSizeChange?: (position: WidgetPosition) => void
) => {
  const [position, setPosition] = useState<WidgetPosition>(initialPosition);
  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    initialWidth: 0,
    initialHeight: 0,
    initialX: 0,
    initialY: 0,
  });

  const handleResizeStart = useCallback((event: GestureResponderEvent) => {
    const { pageX, pageY } = event.nativeEvent;
    setResizeState({
      isResizing: true,
      initialWidth: position.width,
      initialHeight: position.height,
      initialX: pageX,
      initialY: pageY,
    });
  }, [position]);

  const handleResizeMove = useCallback(
    (event: GestureResponderEvent) => {
      if (!resizeState.isResizing) return;

      const { pageX, pageY } = event.nativeEvent;
      const deltaX = pageX - resizeState.initialX;
      const deltaY = pageY - resizeState.initialY;

      const newWidth = Math.max(
        WIDGET_CONSTRAINTS.minWidth,
        Math.min(
          WIDGET_CONSTRAINTS.maxWidth,
          resizeState.initialWidth + deltaX
        )
      );

      const newHeight = Math.max(
        WIDGET_CONSTRAINTS.minHeight,
        Math.min(
          WIDGET_CONSTRAINTS.maxHeight,
          resizeState.initialHeight + deltaY
        )
      );

      const newPosition: WidgetPosition = {
        ...position,
        width: newWidth,
        height: newHeight,
      };

      // Constrain to screen bounds
      const constrained = constrainPosition(newPosition, screenWidth, screenHeight);
      setPosition(constrained);
    },
    [resizeState, position, screenWidth, screenHeight]
  );

  const handleResizeEnd = useCallback(() => {
    if (!resizeState.isResizing) return;

    // Snap to grid on release
    const snapped = snapWidgetToGrid(position);
    const constrained = constrainPosition(snapped, screenWidth, screenHeight);
    
    setPosition(constrained);
    setResizeState({
      isResizing: false,
      initialWidth: 0,
      initialHeight: 0,
      initialX: 0,
      initialY: 0,
    });

    onSizeChange?.(constrained);
  }, [resizeState, position, screenWidth, screenHeight, onSizeChange]);

  return {
    position,
    isResizing: resizeState.isResizing,
    handleResizeStart,
    handleResizeMove,
    handleResizeEnd,
    setPosition,
  };
};

