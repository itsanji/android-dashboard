import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, TOUCH_TARGET_SIZE } from '../../constants/theme';
import { useScreenDimensions } from '../../hooks/useScreenDimensions';
import { getResponsiveSpacing } from '../../utils/responsive';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const { screenSize } = useScreenDimensions();

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      minHeight: TOUCH_TARGET_SIZE,
      paddingHorizontal: getResponsiveSpacing(SPACING.md, screenSize),
      paddingVertical: getResponsiveSpacing(SPACING.sm, screenSize),
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    };

    // Size adjustments
    if (size === 'small') {
      baseStyle.paddingHorizontal = getResponsiveSpacing(SPACING.sm, screenSize);
      baseStyle.paddingVertical = getResponsiveSpacing(SPACING.xs, screenSize);
      baseStyle.minHeight = 36;
    } else if (size === 'large') {
      baseStyle.paddingHorizontal = getResponsiveSpacing(SPACING.lg, screenSize);
      baseStyle.paddingVertical = getResponsiveSpacing(SPACING.md, screenSize);
      baseStyle.minHeight = 56;
    }

    // Variant styles
    switch (variant) {
      case 'primary':
        baseStyle.backgroundColor = disabled ? COLORS.text.disabled : COLORS.primary;
        break;
      case 'secondary':
        baseStyle.backgroundColor = disabled ? COLORS.text.disabled : COLORS.secondary;
        break;
      case 'outline':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.borderWidth = 2;
        baseStyle.borderColor = disabled ? COLORS.text.disabled : COLORS.primary;
        break;
    }

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      ...TYPOGRAPHY.body1,
      fontWeight: '600',
    };

    if (size === 'small') {
      baseTextStyle.fontSize = TYPOGRAPHY.body2.fontSize;
    } else if (size === 'large') {
      baseTextStyle.fontSize = TYPOGRAPHY.h3.fontSize;
    }

    // Variant text colors
    if (variant === 'outline') {
      baseTextStyle.color = disabled ? COLORS.text.disabled : COLORS.primary;
    } else {
      baseTextStyle.color = COLORS.onPrimary;
    }

    return baseTextStyle;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? COLORS.primary : COLORS.onPrimary} />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({});

