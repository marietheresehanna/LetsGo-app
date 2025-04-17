// app/onboarding/screen3.tsx
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const Screen3 = ({ onFinish }: { onFinish: () => void }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🔐 Create an account to save favorites!</Text>
      <View style={styles.buttonGroup}>
        <Button title="Create Account" onPress={onFinish} />
        <View style={{ height: 10 }} />
        <Button title="Continue without account" onPress={onFinish} />
      </View>
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
  buttonGroup: {
    marginTop: 20,
    width: '100%',
  },
});

export default Screen3;
