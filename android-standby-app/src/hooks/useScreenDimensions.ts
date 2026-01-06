import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';
import { ScreenDimensions, ScreenSize } from '../types';
import {
  getScreenDimensions,
  getScreenSize,
  isTablet,
  isFoldable,
  isPortrait,
} from '@utils/responsive';

/**
 * Hook to get responsive screen dimensions with updates on orientation change
 */
export const useScreenDimensions = (): ScreenDimensions => {
  const [dimensions, setDimensions] = useState<ScreenDimensions>(() => {
    const { width, height, scale, fontScale } = getScreenDimensions();
    return {
      width,
      height,
      scale,
      fontScale,
      screenSize: getScreenSize(width),
      isPortrait: isPortrait(width, height),
      isTablet: isTablet(width, height),
      isFoldable: isFoldable(width, height),
    };
  });

  useEffect(() => {
    const updateDimensions = ({ window }: { window: ScaledSize }) => {
      const { width, height } = window;
      const { scale, fontScale } = getScreenDimensions();
      
      setDimensions({
        width,
        height,
        scale,
        fontScale,
        screenSize: getScreenSize(width),
        isPortrait: isPortrait(width, height),
        isTablet: isTablet(width, height),
        isFoldable: isFoldable(width, height),
      });
    };

    const subscription = Dimensions.addEventListener('change', updateDimensions);

    return () => {
      subscription?.remove();
    };
  }, []);

  return dimensions;
};

