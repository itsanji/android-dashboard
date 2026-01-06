import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { WidgetProvider } from './src/context/WidgetContext';
import { AppNavigator } from './src/navigation';

export default function App() {
  return (
    <SafeAreaProvider>
      <WidgetProvider>
        <AppNavigator />
      </WidgetProvider>
    </SafeAreaProvider>
  );
}
