import * as Haptics from 'expo-haptics';
import { Platform, Pressable } from 'react-native';
import React from 'react';

export function HapticTab(props: any) {
  return (
    <Pressable
      {...props}
      onPress={(event) => {
        if (Platform.OS === 'web') {
          event.preventDefault(); // ✅ Stop page reload on web
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPress?.(event); // Always call original press handler
      }}
    >
      {props.children}
    </Pressable>
  );
}
