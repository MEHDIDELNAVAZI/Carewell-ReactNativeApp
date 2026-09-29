import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AppNavigator from './src/navigation/AppNavigator';
import LoginScreen from './src/screens/Login/LoginScreen';
import { isLogedIn } from './src/api/auth';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import BrowserScreen from './src/screens/browserscreen';
import { registerBackgroundSync } from './src/api/healthSyncService';
import TicketDetail from './src/components/tickets/TicketDetail';
import CreateTicket from './src/components/tickets/CreateTicket';
import { useUpdateCheck } from './src/hooks/useUpdateCheck';
import IosUpdateModal from './src/components/updatemodals/IosUpdateModal';
import AndroidUpdateModal from './src/components/updatemodals/AndroidUpdateModal';
import { initI18n } from './src/i18n';

import {
  setupNotifications,
  scheduleWellCareReminders,
} from './src/services/notifications/notificationService';
import { registerForegroundHandler } from './src/services/notifications/notificationEvents';
import { navigationRef } from './src/navigation/navigationRef';
import PostureDetailScreen from './src/screens/physioeye/MetricDetailScreen';
import MetricDetailScreen from './src/screens/physioeye/MetricDetailScreen';
import { MetricKey } from './src/components/physioeye';

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;

  Browser: {
    url: string;
  };

  TicketDetail: {
    ticketId: number;
  };

  CreateTicket: undefined;

  MetricDetail: {
    metric: MetricKey;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  const { setIsLoggedIn, isLoggedIn } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const result = await isLogedIn();
        setIsLoggedIn(result);

        if (result) {
          await setupNotifications();
          await scheduleWellCareReminders();
        }
      } catch (error) {
        console.log('AUTH CHECK ERROR:', error);
      } finally {
        setLoading(false);
      }
    };

    checkLogin();
    registerBackgroundSync()
      .then(() => console.log('[App] Background sync registered'))
      .catch(e => console.error('[App] Background sync FAILED:', e));

    const unsubscribe = registerForegroundHandler();
    return () => unsubscribe();
  }, []);

  if (loading) return null;

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <>
            <Stack.Screen name="Home" component={AppNavigator} />
            <Stack.Screen name="Browser" component={BrowserScreen} />
            <Stack.Screen
              name="MetricDetail"
              component={MetricDetailScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="TicketDetail"
              component={TicketDetail}
              options={{
                headerShown: false,
                presentation: 'card',
              }}
            />
            <Stack.Screen
              name="CreateTicket"
              component={CreateTicket}
              options={{
                headerShown: false,
                presentation: 'modal',
              }}
            />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function UpdateGate() {
  const { updateInfo, clearUpdate } = useUpdateCheck();
  console.log('Update info in UpdateGate:', updateInfo); // Debugging line

  if (!updateInfo) return null;

  return Platform.OS === 'ios' ? (
    <IosUpdateModal updateInfo={updateInfo} onClose={clearUpdate} />
  ) : (
    <AndroidUpdateModal updateInfo={updateInfo} onClose={clearUpdate} />
  );
}

export default function App() {
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    initI18n().then(() => setI18nReady(true));
  }, []);

  if (!i18nReady) return null;

  return (
    <AuthProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <RootNavigator />
          <UpdateGate />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </AuthProvider>
  );
}
