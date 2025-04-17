import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { API_BASE_URL } from '@/constants/env';
import Toast from 'react-native-toast-message';

const showMessage = (type: 'success' | 'error', text1: string, text2?: string) => {
  Toast.show({
    type,
    text1,
    text2,
    position: 'top',
    visibilityTime: 3000,
    topOffset: 60,
  });
};

export default function SettingsScreen() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newUsername, setNewUsername] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const getToken = async () => {
    return await AsyncStorage.getItem('token');
  };

  const fetchProfile = async () => {
    try {
      const token = await getToken();

      type ProfileResponse = {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        username: string;
        phone: string;
        gender: string;
        birthdate: string;
      };

      const res = await axios.get<ProfileResponse>(
        `${API_BASE_URL}/api/auth/profile`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUser(res.data);
      setNewUsername(res.data.username);
    } catch (err) {
      showMessage('error','Error', 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const updateUsername = async () => {
    try {
      const token = await getToken();
      const res = await axios.put<{ message: string }>(
        `${API_BASE_URL}/api/auth/update-username`,
        { username: newUsername },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showMessage('success','Success', res.data.message);
    } catch (err: any) {
      showMessage('error','Error', err?.response?.data?.message || 'Failed to update username');
    }
  };

  const updatePassword = async () => {
    try {
      const token = await getToken();
      const res = await axios.put<{ message: string }>(
        `${API_BASE_URL}/api/auth/update-password`,
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showMessage('success','Success', res.data.message);
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      showMessage('error','Error', err?.response?.data?.message || 'Failed to update password');
    }
  };

  const deleteAccount = async () => {
    const isWeb = Platform.OS === 'web';

    const confirm = isWeb
      ? window.confirm('This will permanently delete your account. Are you sure?')
      : await new Promise<boolean>((resolve) => {
          Alert.alert('Are you sure?', 'This will permanently delete your account.', [
            { text: 'Cancel', onPress: () => resolve(false), style: 'cancel' },
            { text: 'Delete', onPress: () => resolve(true), style: 'destructive' },
          ]);
        });

    if (!confirm) return;

    try {
      const token = await getToken();
      const res = await axios.delete<{ message: string }>(
        `${API_BASE_URL}/api/auth/delete-account`,
        {
          headers: { Authorization: `Bearer ${token}` },
          ...(Platform.OS === 'web' ? { data: {} } : {}), // only web needs this
        }
      );
      showMessage('success','Success', res.data.message);
      await AsyncStorage.removeItem('token');
      router.replace('/login');
    } catch (err) {
      showMessage('error','Error', 'Failed to delete account');
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#e23744" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Account Settings</Text>

      <Text style={styles.sectionTitle}>Change Username</Text>
      <TextInput
        style={styles.input}
        value={newUsername}
        onChangeText={setNewUsername}
        placeholder="New username"
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.button} onPress={updateUsername}>
        <Text style={styles.buttonText}>Update Username</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Change Password</Text>
      <TextInput
        style={styles.input}
        value={oldPassword}
        onChangeText={setOldPassword}
        placeholder="Current password"
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="New password"
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={updatePassword}>
        <Text style={styles.buttonText}>Update Password</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Danger Zone</Text>
      <TouchableOpacity style={styles.deleteButton} onPress={deleteAccount}>
        <Text style={styles.deleteText}>Delete My Account</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#e23744',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  deleteButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e23744',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
  },
  deleteText: {
    color: '#e23744',
    fontWeight: '600',
    fontSize: 15,
  },
});
