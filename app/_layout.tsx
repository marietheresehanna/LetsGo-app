import React, { useEffect, useState } from 'react';
import { Slot, SplashScreen } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

// Important: wrap in an async IIFE so errors don’t crash metro
(async () => {
  try {
    await SplashScreen.preventAutoHideAsync();
  } catch (e) {
    console.warn('Could not prevent auto-hide:', e);
  }
})();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        const seen = await AsyncStorage.getItem('hasSeenOnboarding');
        // You can use this value later if needed
      } catch (e) {
        console.error('Onboarding check error:', e);
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    };

    prepare();
  }, []);

  if (!isReady) return null;

  return (
    <>
      <Slot />
      <Toast />
    </>
  );
}
