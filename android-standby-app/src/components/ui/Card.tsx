import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';
import { useScreenDimensions } from '../../hooks/useScreenDimensions';
import { getResponsiveSpacing } from '../../utils/responsive';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding,
  elevated = true,
}) => {
  const { screenSize } = useScreenDimensions();

  const cardStyle: ViewStyle = {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: padding !== undefined 
      ? getResponsiveSpacing(padding, screenSize) 
      : getResponsiveSpacing(SPACING.md, screenSize),
    ...(elevated && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    }),
  };

  return <View style={[cardStyle, style]}>{children}</View>;
};

const styles = StyleSheet.create({});

