// components/ui/TabBarBackground.tsx
import React from 'react';
import { View } from 'react-native';

export default function TabBarBackground() {
  return (
    <View
      style={{
        position: 'absolute',
        bottom: 10,
        left: 20,
        right: 20,
        height: 70,
        backgroundColor: 'white',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 10,
        elevation: 5,
      }}
    />
  );
}
