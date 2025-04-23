import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/constants/env';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface Place {
  _id: string;
  name: string;
  image: string;
  location: string;
  rating: number;
}

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  const fetchFavorites = async () => {
    const storedToken = await AsyncStorage.getItem('token');
    setToken(storedToken);

    if (!storedToken) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get<Place[]>(`${API_BASE_URL}/api/auth/favorites`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      setFavorites(res.data);
    } catch (err) {
      console.error('❌ Error fetching favorites:', err);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const toggleFavorite = async (placeId: string) => {
    if (!token) {
      alert('You must be logged in to favorite places.');
      return;
    }

    const isFav = favorites.some(p => p._id === placeId);

    try {
      if (isFav) {
        await axios.delete(`${API_BASE_URL}/api/auth/favorites/${placeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavorites(prev => prev.filter(p => p._id !== placeId));
      } else {
        await axios.post(`${API_BASE_URL}/api/auth/favorites/${placeId}`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchFavorites();
      }
    } catch (err) {
      console.error('❌ Error toggling favorite:', err);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#e23744" />
      </View>
    );
  }

  if (!token) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>You must be logged in to view your favorites.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }} // ✅ Added for safe spacing
    >
      <Text style={styles.title}>⭐ Your Favorites</Text>

      {favorites.length === 0 ? (
        <Text style={styles.message}>You haven't added any favorites yet.</Text>
      ) : (
        favorites.map((place) => (
          <TouchableOpacity
            key={place._id}
            style={styles.card}
            onPress={() => router.push({ pathname: '/place/[id]', params: { id: place._id } })}
          >
            <Image source={{ uri: place.image }} style={styles.image} />
            <View style={styles.cardContent}>
              <Text style={styles.name}>{place.name}</Text>
              <Text style={styles.location}>📍 {place.location}</Text>
              <Text style={styles.rating}>⭐ {place.rating.toFixed(1)}</Text>
              <TouchableOpacity onPress={() => toggleFavorite(place._id)} style={styles.favoriteIcon}>
                <Ionicons
                  name={favorites.some(p => p._id === place._id) ? 'heart' : 'heart-outline'}
                  size={24}
                  color="#e23744"
                />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#e23744',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  image: {
    height: 180,
    width: '100%',
  },
  cardContent: {
    padding: 12,
    position: 'relative',
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#222',
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  rating: {
    fontSize: 14,
    color: '#000',
    marginTop: 4,
    fontWeight: '500',
  },
  favoriteIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 20,
    elevation: 2,
  },
});
