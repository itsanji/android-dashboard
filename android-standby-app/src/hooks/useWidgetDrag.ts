import { useState, useCallback } from 'react';
import { GestureResponderEvent } from 'react-native';
import { WidgetPosition } from '../types';
import { snapWidgetToGrid, constrainPosition } from '../utils/layout';

interface DragState {
  isDragging: boolean;
  initialX: number;
  initialY: number;
  offsetX: number;
  offsetY: number;
}

export const useWidgetDrag = (
  initialPosition: WidgetPosition,
  screenWidth: number,
  screenHeight: number,
  onPositionChange?: (position: WidgetPosition) => void
) => {
  const [position, setPosition] = useState<WidgetPosition>(initialPosition);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    initialX: 0,
    initialY: 0,
    offsetX: 0,
    offsetY: 0,
  });

  const handleDragStart = useCallback((event: GestureResponderEvent) => {
    const { pageX, pageY } = event.nativeEvent;
    setDragState({
      isDragging: true,
      initialX: pageX,
      initialY: pageY,
      offsetX: pageX - position.x,
      offsetY: pageY - position.y,
    });
  }, [position]);

  const handleDragMove = useCallback(
    (event: GestureResponderEvent) => {
      if (!dragState.isDragging) return;

      const { pageX, pageY } = event.nativeEvent;
      const newX = pageX - dragState.offsetX;
      const newY = pageY - dragState.offsetY;

      const newPosition: WidgetPosition = {
        ...position,
        x: newX,
        y: newY,
      };

      // Constrain to screen bounds
      const constrained = constrainPosition(newPosition, screenWidth, screenHeight);
      setPosition(constrained);
    },
    [dragState, position, screenWidth, screenHeight]
  );

  const handleDragEnd = useCallback(() => {
    if (!dragState.isDragging) return;

    // Snap to grid on release
    const snapped = snapWidgetToGrid(position);
    const constrained = constrainPosition(snapped, screenWidth, screenHeight);
    
    setPosition(constrained);
    setDragState({
      isDragging: false,
      initialX: 0,
      initialY: 0,
      offsetX: 0,
      offsetY: 0,
    });

    onPositionChange?.(constrained);
  }, [dragState, position, screenWidth, screenHeight, onPositionChange]);

  return {
    position,
    isDragging: dragState.isDragging,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    setPosition,
  };
};

