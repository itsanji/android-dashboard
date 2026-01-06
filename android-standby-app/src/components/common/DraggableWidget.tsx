import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  Animated,
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
  
  const pan = useRef(new Animated.ValueXY({ x: widget.position.x, y: widget.position.y })).current;
  const dragStartPosition = useRef({ x: 0, y: 0 });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only start dragging if moved more than 5 pixels
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      
      onPanResponderGrant: () => {
        // Save starting position
        dragStartPosition.current = {
          x: widget.position.x,
          y: widget.position.y,
        };
        
        // Set the offset to current position
        pan.setOffset({
          x: widget.position.x,
          y: widget.position.y,
        });
        pan.setValue({ x: 0, y: 0 });
        
        setIsDragging(true);
        selectWidget(widget.id);
        bringToFront(widget.id);
      },
      
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      
      onPanResponderRelease: (_, gestureState: PanResponderGestureState) => {
        pan.flattenOffset();
        setIsDragging(false);
        
        // Calculate final position
        const newX = dragStartPosition.current.x + gestureState.dx;
        const newY = dragStartPosition.current.y + gestureState.dy;
        
        // Update widget position (will be snapped to grid in context)
        updateWidgetPosition(widget.id, {
          ...widget.position,
          x: newX,
          y: newY,
        });
        
        // Animate to snapped position
        Animated.spring(pan, {
          toValue: { x: newX, y: newY },
          useNativeDriver: false,
          friction: 7,
        }).start();
      },
    })
  ).current;

  const handleTap = () => {
    if (!isDragging) {
      selectWidget(isSelected ? null : widget.id);
      if (!isSelected) {
        bringToFront(widget.id);
      }
    }
  };

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.container,
        {
          left: pan.x,
          top: pan.y,
          width: widget.position.width,
          height: widget.position.height,
          zIndex: widget.zIndex || 1,
          transform: [{ scale: isDragging ? 1.05 : 1 }],
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
          isDragging && styles.dragging,
        ]}
      >
        {children}
        
        {/* Resize Handle (bottom-right corner) */}
        {isSelected && !isDragging && (
          <View style={styles.resizeHandle}>
            <View style={styles.resizeHandleIcon} />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
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

