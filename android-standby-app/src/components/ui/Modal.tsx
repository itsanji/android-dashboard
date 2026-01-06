import React from 'react';
import {
  Modal as RNModal,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';
import { useScreenDimensions } from '../../hooks/useScreenDimensions';
import { getResponsiveSpacing } from '../../utils/responsive';
import { ScreenSize } from '../../types';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  fullScreen?: boolean;
  style?: ViewStyle;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  children,
  fullScreen = false,
  style,
}) => {
  const { screenSize, width, height } = useScreenDimensions();

  const getModalWidth = (): number => {
    if (fullScreen) return width;
    
    // Responsive modal widths
    switch (screenSize) {
      case ScreenSize.XS:
      case ScreenSize.SM:
        return width * 0.9;
      case ScreenSize.MD:
        return width * 0.7;
      case ScreenSize.LG:
      case ScreenSize.XL:
        return Math.min(600, width * 0.6);
      default:
        return width * 0.9;
    }
  };

  const getModalMaxHeight = (): number => {
    if (fullScreen) return height;
    return height * 0.9;
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        <View
          style={[
            styles.modal,
            {
              width: getModalWidth(),
              maxHeight: getModalMaxHeight(),
              padding: getResponsiveSpacing(SPACING.lg, screenSize),
            },
            style,
          ]}
        >
          {children}
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

