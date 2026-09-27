import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Widget, WidgetType } from '../../types';
import { TYPOGRAPHY, COLORS } from '../../constants/theme';

interface PlaceholderWidgetProps {
  widget: Widget;
}

const WIDGET_INFO: Record<WidgetType, { icon: string; name: string }> = {
  [WidgetType.CALENDAR]: { icon: '📅', name: 'Calendar' },
  [WidgetType.WEATHER]: { icon: '🌤️', name: 'Weather' },
  [WidgetType.MEDIA_CONTROLLER]: { icon: '🎵', name: 'Media' },
  [WidgetType.CUSTOM_TEXT]: { icon: '✏️', name: 'Text' },
  [WidgetType.CLOCK]: { icon: '🕐', name: 'Clock' },
};

/**
 * Placeholder widget component
 * Will be replaced with actual widget implementations
 */
export const PlaceholderWidget: React.FC<PlaceholderWidgetProps> = ({ widget }) => {
  const info = WIDGET_INFO[widget.type];

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{info.icon}</Text>
      <Text style={styles.name}>{info.name}</Text>
      <Text style={styles.subtitle}>Widget</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 48,
    marginBottom: 8,
  },
  name: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
  },
});
