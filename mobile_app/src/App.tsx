import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TenantProvider } from './context/TenantContext';
import { AppNavigator } from './navigation/AppNavigator';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <TenantProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
          <StatusBar style="auto" />
        </TenantProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
