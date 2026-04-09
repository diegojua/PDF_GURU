import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useTenantContext } from '../context/TenantContext';
import { HomeScreen } from '../screens/HomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { PdfViewerScreen } from '../screens/PdfViewerScreen';
import { TenantSelectorScreen } from '../screens/TenantSelectorScreen';
import { LoadingScreen } from '../screens/LoadingScreen';

export type RootStackParamList = {
  Loading: undefined;
  TenantSelector: undefined;
  Login: undefined;
  Home: undefined;
  PdfViewer: { documentId: string; documentTitle?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const { selectedTenant, authToken, isLoading } = useTenantContext();
  const signedIn = Boolean(selectedTenant && authToken);

  if (isLoading) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Loading" component={LoadingScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!selectedTenant ? (
        <Stack.Screen name="TenantSelector" component={TenantSelectorScreen} />
      ) : !signedIn ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="PdfViewer" component={PdfViewerScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};
