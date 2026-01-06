import React, { useState, useEffect } from 'react';
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
  const { width, height, screenSize } = useScreenDimensions();
  const [previousDimensions, setPreviousDimensions] = useState({ width, height });

  useEffect(() => {
    // Check if dimensions changed significantly (not just minor adjustments)
    const widthChanged = Math.abs(width - previousDimensions.width) > 50;
    const heightChanged = Math.abs(height - previousDimensions.height) > 50;

    if ((widthChanged || heightChanged) && onWidgetsReflow) {
      // Reflow widgets to new dimensions
      const widgetData = widgets.map((w) => ({ id: w.id, position: w.position }));
      const reflowed = reflowWidgets(
        widgetData,
        previousDimensions.width,
        previousDimensions.height,
        width,
        height
      );

      // Convert to position map
      const newPositions: Record<string, WidgetPosition> = {};
      reflowed.forEach((item) => {
        newPositions[item.id] = item.position;
      });

      onWidgetsReflow(newPositions);
      setPreviousDimensions({ width, height });
    }
  }, [width, height, screenSize]);

  return (
    <View style={[styles.container, { width, height }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
});

