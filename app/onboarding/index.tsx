// app/onboarding/index.tsx
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';



const Onboarding = () => {
  const [page, setPage] = useState(1);
  const router = useRouter();

  const next = () => setPage((prev) => Math.min(prev + 1, 3));
  const skip = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    router.replace('/(tabs)');
  };
  
  const finish = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    router.replace('/(tabs)');
  };
  

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipBtn} onPress={skip}>
        <Text style={styles.skipText}>✕</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        {page === 1 && <Text style={styles.text}>🍽️ Discover the best spots in Lebanon</Text>}
        {page === 2 && <Text style={styles.text}>🎯 Filter by mood, budget, and location</Text>}
        {page === 3 && (
          <>
            <Text style={styles.text}>🔐 Create an account to save favorites!</Text>
            <View style={styles.buttonGroup}>
              <Button title="Create Account" onPress={finish} />
              <View style={{ height: 10 }} />
              <Button title="Continue without account" onPress={skip} />
            </View>
          </>
        )}
      </View>

      {page < 3 && <Button title="Next" onPress={next} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    justifyContent: 'space-between',
  },
  skipBtn: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  skipText: {
    fontSize: 22,
    color: '#999',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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

export default Onboarding;
