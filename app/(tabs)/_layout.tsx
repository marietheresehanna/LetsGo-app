// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#e23744', // Zomato red
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#eee',
          height: 60,
          paddingBottom: Platform.OS === 'ios' ? 10 : 8,
          paddingTop: 5,
          position: 'absolute', // fixed
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0, // remove shadow on Android
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
<Tabs.Screen
  name="index"
  options={{
    title: 'Home',
    tabBarIcon: ({ color }: { color: string }) => (
      <IconSymbol size={24} name="home" color={color} />
    ),
  }}
/>

<Tabs.Screen
  name="explore"
  options={{
    title: 'Explore',
    tabBarIcon: ({ color }: { color: string }) => (
      <IconSymbol size={24} name="search" color={color} />
    ),
  }}
/>

<Tabs.Screen
  name="favorites"
  options={{
    title: 'Favorites',
    tabBarIcon: ({ color }: { color: string }) => (
      <IconSymbol size={24} name="star" color={color} />
    ),
  }}
/>

<Tabs.Screen
  name="account"
  options={{
    title: 'Account',
    tabBarIcon: ({ color }: { color: string }) => (
      <IconSymbol size={24} name="person" color={color} />
    ),
  }}
/>

    </Tabs>
  );
}
