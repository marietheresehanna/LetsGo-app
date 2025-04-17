// app/onboarding/screen1.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Screen1 = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🍽️ Discover the best spots in Lebanon</Text>
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

export default Screen1;
