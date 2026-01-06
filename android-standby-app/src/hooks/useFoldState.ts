import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';

export interface FoldState {
  isFolded: boolean;
  isFoldable: boolean;
  foldAngle?: number;
  screenMode: 'folded' | 'unfolded' | 'normal';
}

/**
 * Hook to detect and track foldable device state
 * Detects Samsung Galaxy Z Fold and Z Flip devices
 */
export const useFoldState = (): FoldState => {
  const [foldState, setFoldState] = useState<FoldState>(() => {
    const { width, height } = Dimensions.get('window');
    const minDimension = Math.min(width, height);
    const maxDimension = Math.max(width, height);
    const aspectRatio = maxDimension / minDimension;

    // Detect if device is likely a foldable
    const isFoldable = aspectRatio > 2.5 || (width > 700 && height > 700);
    
    // Z Flip folded: ~width < 300dp
    // Z Fold folded: ~width < 400dp
    // Z Fold unfolded: ~width > 700dp
    const isFolded = isFoldable && minDimension < 400;
    
    return {
      isFolded,
      isFoldable,
      screenMode: isFoldable ? (isFolded ? 'folded' : 'unfolded') : 'normal',
    };
  });

  useEffect(() => {
    const updateFoldState = () => {
      const { width, height } = Dimensions.get('window');
      const minDimension = Math.min(width, height);
      const maxDimension = Math.max(width, height);
      const aspectRatio = maxDimension / minDimension;

      const isFoldable = aspectRatio > 2.5 || (width > 700 && height > 700);
      const isFolded = isFoldable && minDimension < 400;

      setFoldState({
        isFolded,
        isFoldable,
        screenMode: isFoldable ? (isFolded ? 'folded' : 'unfolded') : 'normal',
      });
    };

    const subscription = Dimensions.addEventListener('change', updateFoldState);

    return () => {
      subscription?.remove();
    };
  }, []);

  return foldState;
};

