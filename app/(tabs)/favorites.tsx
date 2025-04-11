import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '@/constants/env';
import { useRouter } from 'expo-router';

type Place = {
  _id: string;
  name: string;
  image: string;
  location: string;
  rating: number;
};

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<Place[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchFavorites = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      try {
        const res = await axios.get<Place[]>(`${API_BASE_URL}/api/auth/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavorites(res.data);
        setIsLoggedIn(true);
      } catch (err) {
        console.error('Failed to load favorites', err);
      }
    };

    fetchFavorites();
  }, []);

  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>⭐ Your Favorites</Text>
        <Text style={styles.sub}>Log in to view your favorite places.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.listContainer}>
      <Text style={styles.title}>⭐ Your Favorites</Text>

      {favorites.map((place) => (
        <TouchableOpacity
          key={place._id}
          style={styles.card}
          onPress={() => router.push({ pathname: '/place/[id]', params: { id: place._id } })}
        >
          <Image source={{ uri: place.image }} style={styles.image} />
          <View style={styles.content}>
            <Text style={styles.name}>{place.name}</Text>
            <Text style={styles.info}>
              ⭐ {place.rating.toFixed(1)} ‧ 📍 {place.location}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#e23744',
    marginBottom: 20,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sub: {
    marginTop: 10,
    fontSize: 14,
    color: '#555',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    height: 180,
    width: '100%',
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  info: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
});
