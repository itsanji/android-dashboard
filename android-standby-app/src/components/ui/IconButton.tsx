import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, TOUCH_TARGET_SIZE } from '../../constants/theme';

interface IconButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  size?: number;
  backgroundColor?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

export const IconButton: React.FC<IconButtonProps> = ({
  onPress,
  children,
  size = TOUCH_TARGET_SIZE,
  backgroundColor = 'transparent',
  disabled = false,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          width: size,
          height: size,
          backgroundColor: disabled ? COLORS.text.disabled : backgroundColor,
          borderRadius: size / 2,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

