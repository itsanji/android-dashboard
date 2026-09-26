import React, { useRef, useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, PanResponder, PanResponderGestureState } from 'react-native';
import { Widget } from '../../types';
import { COLORS, TOUCH_TARGET_SIZE, WIDGET_CONSTRAINTS } from '../../constants/theme';
import { useWidgets } from '../../context/WidgetContext';

// Movement (px) below which a gesture counts as a tap
const TAP_THRESHOLD = 5;

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
  const wasSelectedRef = useRef(false);

  // The PanResponders below are created once, so everything they read must
  // come from refs to avoid stale closures.
  const latestRef = useRef({
    widget,
    isSelected,
    updateWidgetPosition,
    selectWidget,
    bringToFront,
  });
  useEffect(() => {
    latestRef.current = { widget, isSelected, updateWidgetPosition, selectWidget, bringToFront };
  });

  // Drag PanResponder
  const dragPanResponder = useMemo(
    () =>
      // Refs are only read inside gesture callbacks, never during render
      // eslint-disable-next-line react-hooks/refs
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > TAP_THRESHOLD || Math.abs(gestureState.dy) > TAP_THRESHOLD,

        onPanResponderGrant: () => {
          const { widget: currentWidget, isSelected: selected } = latestRef.current;
          dragStartRef.current = { ...currentWidget.position };
          wasSelectedRef.current = selected;

          setDragOffset({ x: 0, y: 0 });
          setIsDragging(true);
          latestRef.current.selectWidget(currentWidget.id);
          latestRef.current.bringToFront(currentWidget.id);
        },

        onPanResponderMove: (_, gestureState: PanResponderGestureState) => {
          setDragOffset({ x: gestureState.dx, y: gestureState.dy });
        },

        onPanResponderRelease: (_, gestureState: PanResponderGestureState) => {
          setIsDragging(false);
          setDragOffset({ x: 0, y: 0 });

          const { widget: currentWidget, selectWidget: select } = latestRef.current;

          // If it didn't move much, treat as a tap: toggle selection
          const moved =
            Math.abs(gestureState.dx) > TAP_THRESHOLD || Math.abs(gestureState.dy) > TAP_THRESHOLD;
          if (!moved) {
            select(wasSelectedRef.current ? null : currentWidget.id);
            return;
          }

          // Update position (Context will handle snapping and constraints)
          latestRef.current.updateWidgetPosition(currentWidget.id, {
            ...currentWidget.position,
            x: dragStartRef.current.x + gestureState.dx,
            y: dragStartRef.current.y + gestureState.dy,
          });
        },

        onPanResponderTerminate: () => {
          // Gesture was taken over (e.g. by the system); discard the drag
          setIsDragging(false);
          setDragOffset({ x: 0, y: 0 });
        },
      }),
    []
  );

  // Resize PanResponder
  const resizePanResponder = useMemo(
    () =>
      // Refs are only read inside gesture callbacks, never during render
      // eslint-disable-next-line react-hooks/refs
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderTerminationRequest: () => false,

        onPanResponderGrant: () => {
          resizeStartRef.current = { ...latestRef.current.widget.position };
          setResizeOffset({ width: 0, height: 0 });
          setIsResizing(true);
        },

        onPanResponderMove: (_, gestureState: PanResponderGestureState) => {
          const newWidth = Math.max(
            WIDGET_CONSTRAINTS.minWidth,
            resizeStartRef.current.width + gestureState.dx
          );
          const newHeight = Math.max(
            WIDGET_CONSTRAINTS.minHeight,
            resizeStartRef.current.height + gestureState.dy
          );

          setResizeOffset({
            width: newWidth - resizeStartRef.current.width,
            height: newHeight - resizeStartRef.current.height,
          });
        },

        onPanResponderRelease: (_, gestureState: PanResponderGestureState) => {
          setIsResizing(false);
          setResizeOffset({ width: 0, height: 0 });

          const { widget: currentWidget } = latestRef.current;

          // Update position (Context will handle snapping and constraints)
          latestRef.current.updateWidgetPosition(currentWidget.id, {
            ...currentWidget.position,
            width: Math.max(
              WIDGET_CONSTRAINTS.minWidth,
              resizeStartRef.current.width + gestureState.dx
            ),
            height: Math.max(
              WIDGET_CONSTRAINTS.minHeight,
              resizeStartRef.current.height + gestureState.dy
            ),
          });
        },

        onPanResponderTerminate: () => {
          setIsResizing(false);
          setResizeOffset({ width: 0, height: 0 });
        },
      }),
    []
  );

  // Calculate display position and size
  // Only move visually once past the tap threshold, so taps don't jitter
  const showDrag =
    isDragging &&
    (Math.abs(dragOffset.x) > TAP_THRESHOLD || Math.abs(dragOffset.y) > TAP_THRESHOLD);
  const displayX = widget.position.x + (showDrag ? dragOffset.x : 0);
  const displayY = widget.position.y + (showDrag ? dragOffset.y : 0);
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
          transform: [{ scale: showDrag || isResizing ? 1.05 : 1 }],
        },
      ]}
    >
      <View
        {...dragPanResponder.panHandlers}
        style={[
          styles.content,
          {
            backgroundColor: widget.style?.backgroundColor || COLORS.widgetBackground,
            borderRadius: widget.style?.borderRadius ?? 12,
            padding: widget.style?.padding ?? 12,
            opacity: widget.style?.opacity ?? 1,
          },
          isSelected && styles.selected,
          (showDrag || isResizing) && styles.dragging,
        ]}
      >
        {children}
      </View>

      {/* Resize Handle (bottom-right corner) - Outside content to capture events independently */}
      {isSelected && !showDrag && (
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
