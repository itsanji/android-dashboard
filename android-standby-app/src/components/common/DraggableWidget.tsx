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
  const [resizeOffset, setResizeOffset] = useState({ width: 0, height: 0 });
  
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
        // Only start drag if moved more than threshold
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
        const wasDragging = isDragging;
        setIsDragging(false);
        setDragOffset({ x: 0, y: 0 });
        
        // If didn't move much, treat as tap
        const moved = Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
        if (!moved && !wasDragging) {
          // Handle tap
          selectWidget(isSelected ? null : widget.id);
          return;
        }
        
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
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      
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
        
        setResizeOffset({ width: 0, height: 0 });
        setIsResizing(true);
      },
      
      onPanResponderMove: (_, gestureState: PanResponderGestureState) => {
        // Update resize offset for visual feedback
        const newWidth = Math.max(100, resizeStartRef.current.width + gestureState.dx);
        const newHeight = Math.max(100, resizeStartRef.current.height + gestureState.dy);
        
        setResizeOffset({
          width: newWidth - resizeStartRef.current.width,
          height: newHeight - resizeStartRef.current.height,
        });
      },
      
      onPanResponderRelease: (_, gestureState: PanResponderGestureState) => {
        setIsResizing(false);
        setResizeOffset({ width: 0, height: 0 });
        
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


  // Calculate display position and size
  const displayX = widget.position.x + (isDragging ? dragOffset.x : 0);
  const displayY = widget.position.y + (isDragging ? dragOffset.y : 0);
  const displayWidth = widget.position.width + (isResizing ? resizeOffset.width : 0);
  const displayHeight = widget.position.height + (isResizing ? resizeOffset.height : 0);
  
  return (
    <View
      style={[
        styles.container,
        {
          left: displayX,
          top: displayY,
          width: displayWidth,
          height: displayHeight,
          zIndex: widget.zIndex || 1,
          transform: [{ scale: isDragging || isResizing ? 1.05 : 1 }],
        },
      ]}
    >
      <View
        {...dragPanResponder.panHandlers}
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
      </View>
      
      {/* Resize Handle (bottom-right corner) - Outside content to capture events independently */}
      {isSelected && !isDragging && (
        <View {...resizePanResponder.panHandlers} style={styles.resizeHandle}>
          <View style={styles.resizeHandleIcon} />
        </View>
      )}
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
    right: -16,
    bottom: -16,
    width: TOUCH_TARGET_SIZE,
    height: TOUCH_TARGET_SIZE,
    backgroundColor: COLORS.primary,
    borderRadius: TOUCH_TARGET_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.onPrimary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  resizeHandleIcon: {
    width: 16,
    height: 16,
    borderRightWidth: 3,
    borderBottomWidth: 3,
    borderColor: COLORS.onPrimary,
  },
});

