import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { API_BASE_URL } from '@/constants/env';

type AuthResponse = {
  user: { _id: string; name: string; email: string };
  token: string;
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const router = useRouter();

  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email) && email.endsWith('.com');
  };

  const handleLogin = async () => {
    const tempErrors: typeof errors = {};

    if (!email) tempErrors.email = 'Email is required';
    else if (!validateEmail(email)) tempErrors.email = 'Enter a valid email ending in .com';

    if (!password) tempErrors.password = 'Password is required';
    setErrors(tempErrors);

    if (Object.keys(tempErrors).length > 0) return;

    try {
      const res = await axios.post<AuthResponse>(`${API_BASE_URL}/api/auth/login`, {
        email,
        password,
      });
      console.log('🧠 Login Response:', res.data);

      await AsyncStorage.setItem('token', res.data.token);
      await AsyncStorage.setItem('userId', res.data.user._id);

      router.replace('/(tabs)');
    } catch (err: any) {
      setErrors({ email: err?.response?.data?.message || 'Login failed' });
    }
  };

  return (
    <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.replace('/(tabs)/account')}>
  <Text style={styles.closeText}>✕</Text>
</TouchableOpacity>

      <Text style={styles.title}>Log In</Text>

      {/* Email */}
      <Text style={styles.label}>Email</Text>
      {errors.email && <Text style={styles.error}>{errors.email}</Text>}
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Password */}
      <Text style={styles.label}>Password</Text>
      {errors.password && <Text style={styles.error}>{errors.password}</Text>}
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.link} onPress={() => router.push('/signup')}>
        <Text style={styles.linkText}>Don’t have an account? Sign up</Text>
      </TouchableOpacity>
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
    fontSize: 26,
    fontWeight: '700',
    color: '#e23744',
    marginBottom: 30,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#222',
    marginBottom: 4,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
  },
  error: {
    color: '#e23744',
    fontSize: 13,
    marginBottom: 4,
  },
  button: {
    backgroundColor: '#e23744',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    marginTop: 18,
    alignItems: 'center',
  },
  linkText: {
    color: '#e23744',
    fontSize: 14,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 24,
    zIndex: 10,
  },
  
  closeText: {
    fontSize: 24,
    color: '#e23744',
  },
  
});
