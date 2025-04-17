// app/onboarding/screen2.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Screen2 = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🎯 Filter by mood, budget, and location</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 22,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default Screen2;
