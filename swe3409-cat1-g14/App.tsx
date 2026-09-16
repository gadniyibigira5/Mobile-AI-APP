// App.tsx
//
// The entry point of the app.
//
// Wraps the entire navigation tree in the ThemeProvider so every screen and
// component can read the current colour scheme with useTheme().

import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider } from './src/ThemeContext.tsx';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}