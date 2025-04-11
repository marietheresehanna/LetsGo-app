import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { API_BASE_URL } from '@/constants/env';

export default function AccountScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
  
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
  
      const res = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      setUser(res.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };
  

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    router.replace('/login');
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#e23744" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>You're not logged in</Text>
        <Text style={{ textAlign: 'center', color: '#555', marginBottom: 20 }}>
          Please log in to access your account.
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/login')}>
          <Text style={styles.buttonText}>Start Now</Text>
        </TouchableOpacity>
      </View>
    );
  }
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Account</Text>

      <View style={styles.infoBox}>
        <InfoRow label="First Name" value={user.firstName} />
        <InfoRow label="Last Name" value={user.lastName} />
        <InfoRow label="Username" value={user.username || '-'} />
        <InfoRow label="Email" value={user.email} />
        <InfoRow label="Phone" value={user.phone} />
        <InfoRow label="Gender" value={user.gender} />
        <InfoRow label="Birthdate" value={user.birthdate} />
      </View>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/settings')}>
        <Text style={styles.buttonText}>Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
        <Text style={[styles.buttonText, { color: '#e23744' }]}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#e23744',
    marginBottom: 24,
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 16,
    marginBottom: 30,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  label: {
    fontWeight: '500',
    color: '#555',
  },
  value: {
    color: '#111',
  },
  button: {
    backgroundColor: '#e23744',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  logoutButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e23744',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
});
