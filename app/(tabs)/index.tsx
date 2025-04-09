// app/(tabs)/index.tsx
import { API_BASE_URL } from '@/constants/env';

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

type PlaceType = {
  name: string;
  image: string;
  location: string;
  rating: number;
};

export default function HomeScreen() {
  const [places, setPlaces] = useState<PlaceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('');

  const fetchPlaces = async () => {
    try {
      const res = await axios.get<PlaceType[]>(`${API_BASE_URL}/api/places`);
      setPlaces(res.data);
    } catch (err) {
      console.error('Error fetching places:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchUserName = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const res = await axios.get<{ name: string }>(
          'http://192.168.0.102:5000/api/auth/profile',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUserName(res.data.name);
      }
    } catch (err) {
      console.error('Error fetching user name:', err);
    }
  };

  useEffect(() => {
    fetchPlaces();
    fetchUserName();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPlaces();
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#e23744" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {userName || 'Guest'}</Text>
        <Text style={styles.subheading}>Where do you wanna go today?</Text>
      </View>

      {places.map((place, index) => (
        <View key={index} style={styles.card}>
          <Image source={{ uri: place.image }} style={styles.image} />
          <View style={styles.details}>
            <Text style={styles.name}>{place.name}</Text>
            <Text style={styles.meta}>⭐ {place.rating} ‧ {place.location}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: '#e23744',
  },
  subheading: {
    fontSize: 16,
    fontWeight: '400',
    color: '#333',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 180,
  },
  details: {
    padding: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
  meta: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});
