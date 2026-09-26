import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Widget, WidgetPosition } from '../../types';
import { useScreenDimensions } from '../../hooks/useScreenDimensions';
import { reflowWidgets } from '../../utils/layout';

interface WidgetGridProps {
  children: React.ReactNode;
  widgets: Widget[];
  onWidgetsReflow?: (newPositions: Record<string, WidgetPosition>) => void;
  style?: ViewStyle;
}

/**
 * Flexible grid container that handles responsive widget layout
 * Automatically reflows widgets when screen size changes
 */
export const WidgetGrid: React.FC<WidgetGridProps> = ({
  children,
  widgets,
  onWidgetsReflow,
  style,
}) => {
  const { width, height } = useScreenDimensions();
  const previousDimensions = useRef({ width, height });
  // Latest props for the effect, which should only re-run on dimension changes
  const latestRef = useRef({ widgets, onWidgetsReflow });
  useEffect(() => {
    latestRef.current = { widgets, onWidgetsReflow };
  });

  useEffect(() => {
    // Check if dimensions changed significantly (not just minor adjustments)
    const { widgets, onWidgetsReflow } = latestRef.current;
    const prev = previousDimensions.current;
    const widthChanged = Math.abs(width - prev.width) > 50;
    const heightChanged = Math.abs(height - prev.height) > 50;

    if ((widthChanged || heightChanged) && onWidgetsReflow) {
      // Reflow widgets to new dimensions
      const widgetData = widgets.map((w) => ({ id: w.id, position: w.position }));
      const reflowed = reflowWidgets(widgetData, prev.width, prev.height, width, height);

      // Convert to position map
      const newPositions: Record<string, WidgetPosition> = {};
      reflowed.forEach((item) => {
        newPositions[item.id] = item.position;
      });

      onWidgetsReflow(newPositions);
      previousDimensions.current = { width, height };
    }
  }, [width, height]);

  return <View style={[styles.container, { width, height }, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
});
