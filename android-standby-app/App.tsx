import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DemoScreen } from './src/screens/DemoScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <DemoScreen />
    </SafeAreaProvider>
  );
}
