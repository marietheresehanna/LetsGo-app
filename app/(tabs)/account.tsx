import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function AccountScreen() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem('token');
      setLoggedIn(!!token);
    };

    checkLogin();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    setLoggedIn(false);
  };

  if (loggedIn === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#e23744" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loggedIn ? (
        <>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.sub}>
            You’re logged in. Manage your profile and preferences here.
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleLogout}>
            <Text style={styles.buttonText}>Log Out</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.title}>Your Account</Text>
          <Text style={styles.sub}>
            Sign in or create an account to personalize your experience.
          </Text>
          <TouchableOpacity style={styles.button} onPress={() => router.push('/login')}>
            <Text style={styles.buttonText}>Log In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.outline]}
            onPress={() => router.push('/signup')}
          >
            <Text style={[styles.buttonText, styles.outlineText]}>Sign Up</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#e23744',
    marginBottom: 12,
    textAlign: 'center',
  },
  sub: {
    fontSize: 14,
    color: '#555',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#e23744',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  outline: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e23744',
  },
  outlineText: {
    color: '#e23744',
  },
});
