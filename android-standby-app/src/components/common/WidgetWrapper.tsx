import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Widget, WidgetPosition } from '../../types';
import { COLORS } from '../../constants/theme';
import { useScreenDimensions } from '../../hooks/useScreenDimensions';
import { normalize } from '../../utils/responsive';

interface WidgetWrapperProps {
  widget: Widget;
  children: React.ReactNode;
  isEditing?: boolean;
  onPress?: () => void;
}

/**
 * Responsive wrapper component for all widgets
 * Handles positioning, sizing, and responsive behavior
 */
export const WidgetWrapper: React.FC<WidgetWrapperProps> = ({
  widget,
  children,
  isEditing = false,
  onPress,
}) => {
  const { screenSize } = useScreenDimensions();

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      position: 'absolute',
      left: widget.position.x,
      top: widget.position.y,
      width: widget.position.width,
      height: widget.position.height,
      backgroundColor: widget.style?.backgroundColor || COLORS.widgetBackground,
      borderRadius: widget.style?.borderRadius || 12,
      padding: normalize(widget.style?.padding || 12),
      opacity: widget.style?.opacity !== undefined ? widget.style.opacity : 1,
      overflow: 'hidden',
      zIndex: widget.zIndex || 1,
    };

    // Add border when editing
    if (isEditing) {
      baseStyle.borderWidth = 2;
      baseStyle.borderColor = COLORS.primary;
      baseStyle.borderStyle = 'dashed';
    } else {
      baseStyle.borderWidth = 1;
      baseStyle.borderColor = COLORS.widgetBorder;
    }

    // Add shadow for depth
    baseStyle.shadowColor = '#000';
    baseStyle.shadowOffset = { width: 0, height: 2 };
    baseStyle.shadowOpacity = 0.25;
    baseStyle.shadowRadius = 4;
    baseStyle.elevation = 4;

    return baseStyle;
  };

  return (
    <View style={getContainerStyle()} onTouchEnd={onPress}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({});

