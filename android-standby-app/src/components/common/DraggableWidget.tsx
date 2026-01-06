import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  TouchableOpacity,
  PanResponderGestureState,
} from 'react-native';
import { Widget } from '../../types';
import { COLORS, TOUCH_TARGET_SIZE } from '../../constants/theme';
import { useWidgets } from '../../context/WidgetContext';

interface DraggableWidgetProps {
  widget: Widget;
  children: React.ReactNode;
  isSelected: boolean;
}

export const DraggableWidget: React.FC<DraggableWidgetProps> = ({
  widget,
  children,
  isSelected,
}) => {
  const { updateWidgetPosition, selectWidget, bringToFront } = useWidgets();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const dragStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const widgetRef = useRef(widget);
  
  // Keep widgetRef up to date
  useEffect(() => {
    widgetRef.current = widget;
  }, [widget]);


  // Drag PanResponder
  const dragPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isResizing,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        if (isResizing) return false;
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      
      onPanResponderGrant: () => {
        // Use widgetRef to get the LATEST widget data (not stale closure)
        const currentWidget = widgetRef.current;
        dragStartRef.current = {
          x: currentWidget.position.x,
          y: currentWidget.position.y,
          width: currentWidget.position.width,
          height: currentWidget.position.height,
        };
        
        setDragOffset({ x: 0, y: 0 });
        setIsDragging(true);
        selectWidget(currentWidget.id);
        bringToFront(currentWidget.id);
      },
      
      onPanResponderMove: (_, gestureState: PanResponderGestureState) => {
        // Update drag offset for visual feedback
        setDragOffset({
          x: gestureState.dx,
          y: gestureState.dy,
        });
      },
      
      onPanResponderRelease: (_, gestureState: PanResponderGestureState) => {
        setIsDragging(false);
        setDragOffset({ x: 0, y: 0 });
        
        // Calculate final position from gesture
        const finalX = dragStartRef.current.x + gestureState.dx;
        const finalY = dragStartRef.current.y + gestureState.dy;
        
        const currentWidget = widgetRef.current;
        
        // Update position (Context will handle snapping and constraints)
        updateWidgetPosition(currentWidget.id, {
          ...currentWidget.position,
          x: finalX,
          y: finalY,
        });
      },
    })
  ).current;

  // Resize PanResponder
  const resizePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isSelected,
      onMoveShouldSetPanResponder: () => isSelected,
      
      onPanResponderGrant: (evt) => {
        evt.stopPropagation();
        // Use widgetRef to get the LATEST widget data (not stale closure)
        const currentWidget = widgetRef.current;
        resizeStartRef.current = {
          x: currentWidget.position.x,
          y: currentWidget.position.y,
          width: currentWidget.position.width,
          height: currentWidget.position.height,
        };
        
        setIsResizing(true);
      },
      
      onPanResponderMove: (_, gestureState: PanResponderGestureState) => {
        // Resize offset will be handled in render
        // No need to set state here for better performance
      },
      
      onPanResponderRelease: (_, gestureState: PanResponderGestureState) => {
        setIsResizing(false);
        
        // Calculate final size from gesture
        const finalWidth = Math.max(100, resizeStartRef.current.width + gestureState.dx);
        const finalHeight = Math.max(100, resizeStartRef.current.height + gestureState.dy);
        
        const currentWidget = widgetRef.current;
        
        // Update position (Context will handle snapping and constraints)
        updateWidgetPosition(currentWidget.id, {
          ...currentWidget.position,
          width: finalWidth,
          height: finalHeight,
        });
      },
    })
  ).current;

  const handleTap = () => {
    if (!isDragging && !isResizing) {
      selectWidget(isSelected ? null : widget.id);
      if (!isSelected) {
        bringToFront(widget.id);
      }
    }
  };

  // Calculate display position: widget.position + drag offset
  const displayX = widget.position.x + (isDragging ? dragOffset.x : 0);
  const displayY = widget.position.y + (isDragging ? dragOffset.y : 0);
  
  return (
    <View
      {...dragPanResponder.panHandlers}
      style={[
        styles.container,
        {
          left: displayX,
          top: displayY,
          width: widget.position.width,
          height: widget.position.height,
          zIndex: widget.zIndex || 1,
          transform: [{ scale: isDragging || isResizing ? 1.05 : 1 }],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleTap}
        style={[
          styles.content,
          {
            backgroundColor: widget.style?.backgroundColor || COLORS.widgetBackground,
            borderRadius: widget.style?.borderRadius || 12,
            padding: widget.style?.padding || 12,
            opacity: widget.style?.opacity !== undefined ? widget.style.opacity : 1,
          },
          isSelected && styles.selected,
          (isDragging || isResizing) && styles.dragging,
        ]}
      >
        {children}
        
        {/* Resize Handle (bottom-right corner) */}
        {isSelected && !isDragging && (
          <View {...resizePanResponder.panHandlers} style={styles.resizeHandle}>
            <View style={styles.resizeHandleIcon} />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  content: {
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  dragging: {
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
  },
  resizeHandle: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: TOUCH_TARGET_SIZE / 2,
    height: TOUCH_TARGET_SIZE / 2,
    backgroundColor: COLORS.primary,
    borderRadius: (TOUCH_TARGET_SIZE / 2) / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resizeHandleIcon: {
    width: 12,
    height: 12,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: COLORS.onPrimary,
  },
});

