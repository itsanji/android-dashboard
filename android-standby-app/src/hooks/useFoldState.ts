import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { FoldMode, getFoldMode } from '../utils/responsive';

export interface FoldState {
  isFolded: boolean;
  isFoldable: boolean;
  foldAngle?: number;
  screenMode: FoldMode;
}

const computeFoldState = (): FoldState => {
  const { width, height } = Dimensions.get('window');
  const screenMode = getFoldMode(width, height);
  return {
    isFolded: screenMode === 'folded',
    isFoldable: screenMode !== 'normal',
    screenMode,
  };
};

/**
 * Hook to detect and track foldable device state
 * Detects Samsung Galaxy Z Fold and Z Flip devices
 */
export const useFoldState = (): FoldState => {
  const [foldState, setFoldState] = useState<FoldState>(computeFoldState);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', () => {
      setFoldState(computeFoldState());
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  return foldState;
};
