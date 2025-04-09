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

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const router = useRouter();

  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email) && email.endsWith('.com');
  };

  const handleSignup = async () => {
    let tempErrors: typeof errors = {};

    if (!name) tempErrors.name = 'Name is required';
    if (!email) tempErrors.email = 'Email is required';
    else if (!validateEmail(email)) tempErrors.email = 'Enter a valid email ending in .com';

    if (!password) tempErrors.password = 'Password is required';
    else if (password.length < 8) tempErrors.password = 'Password must be at least 8 characters';

    setErrors(tempErrors);

    if (Object.keys(tempErrors).length > 0) return;

    try {
      const res = await axios.post<AuthResponse>(`${API_BASE_URL}/api/auth/signup`, {
        name,
        email,
        password,
      });

      await AsyncStorage.setItem('token', res.data.token);
      router.replace('/(tabs)');
    } catch (err: any) {
      setErrors({ email: err?.response?.data?.message || 'Signup failed' });
    }
  };

  return (
    <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.replace('/(tabs)/account')}>
  <Text style={styles.closeText}>✕</Text>
</TouchableOpacity>

      <Text style={styles.title}>Create Account</Text>

      {/* Name */}
      <Text style={styles.label}>Full Name</Text>
      {errors.name && <Text style={styles.error}>{errors.name}</Text>}
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

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

      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.link} onPress={() => router.push('/login')}>
        <Text style={styles.linkText}>Already have an account? Log In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
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
    fontWeight: '600',
    fontSize: 16,
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
