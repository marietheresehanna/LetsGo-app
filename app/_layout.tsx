import React, { useEffect, useState } from 'react';
import { Slot, SplashScreen } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        const seen = await AsyncStorage.getItem('hasSeenOnboarding');
        // ✅ Don’t navigate here! Let initial screen load naturally based on condition
      } catch (e) {
        console.error('Onboarding check error:', e);
      } finally {
        setIsReady(true);
        SplashScreen.hideAsync();
      }
    };

    prepare();
  }, []);

  if (!isReady) return null;

  return <Slot />;
}
