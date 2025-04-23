import { API_BASE_URL } from '@/constants/env';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type PlaceType = {
  _id: string;
  name: string;
  image: string;
  location: string;
  rating: number;
};

export default function HomeScreen() {
  const [places, setPlaces] = useState<PlaceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  const fetchPlaces = async (type = '') => {
    try {
      setLoading(true);
      const url = type
        ? `${API_BASE_URL}/api/places?type=${type}`
        : `${API_BASE_URL}/api/places`;
        console.log('🌐 Fetching places from:', url);
        const res = await axios.get<PlaceType[]>(url);
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
      setToken(token);
      if (token) {
        const res = await axios.get<{ username: string }>(
          `${API_BASE_URL}/api/auth/profile`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUserName(res.data.username);
      }
    } catch (err) {
      console.error('Error fetching user name:', err);
    }
  };

  const fetchFavorites = async () => {
    const token = await AsyncStorage.getItem('token');
    setToken(token);
    if (token) {
      const res = await axios.get(`${API_BASE_URL}/api/auth/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ids = res.data.map((p: any) => p._id);
      setFavoriteIds(ids);
    }
  };

  const toggleFavorite = async (placeId: string) => {
    if (!token) {
      alert('You must be logged in to favorite places.');
      return;
    }
    const isFav = favoriteIds.includes(placeId);
    try {
      if (isFav) {
        await axios.delete(`${API_BASE_URL}/api/auth/favorites/${placeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavoriteIds((prev) => prev.filter((id) => id !== placeId));
      } else {
        await axios.post(`${API_BASE_URL}/api/auth/favorites/${placeId}`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavoriteIds((prev) => [...prev, placeId]);
      }
    } catch (err) {
      console.error('❌ Favorite toggle failed:', err);
    }
  };

  useEffect(() => {
    fetchPlaces();
    fetchUserName();
    fetchFavorites();
    //setLoading(false);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPlaces(selectedCategory || '');
  };

  const categories = ['Cafe', 'Pub', 'Restaurant', 'Lounge'];
  const ratedPlaces = places.filter((p) => p.rating > 4.5);
  const topRated = [...ratedPlaces].sort((a, b) => b.rating - a.rating).slice(0, 5);
  const recommended = [...places].sort(() => 0.5 - Math.random()).slice(0, 5);

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
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.logoBox}>
        <Text style={styles.logoText}>LetsGo</Text>
      </View>

      <Text style={styles.welcome}>Welcome back{userName ? `, ${userName}` : ''}!</Text>

      <Text style={styles.categoryTitle}>Categories</Text>
      <View style={styles.categoryRow}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => {
              router.push({ pathname: '/explore', params: { category: cat } });
            }}
            style={[
              styles.categoryButton,
              selectedCategory === cat && styles.categorySelected,
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === cat && { color: 'white' },
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.categoryTitle}>Recommended For You</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        {recommended.map((place, index) => (
          <TouchableOpacity
            key={`rec-${index}`}
            style={[styles.card, { width: 250, marginRight: 12 }]}
            onPress={() =>
              router.push({ pathname: '/place/[id]', params: { id: place._id } })
            }
          >
            <Image source={{ uri: place.image }} style={styles.image} />
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                toggleFavorite(place._id);
              }}
              style={styles.favoriteIcon}
            >
              <Ionicons
                name={favoriteIds.includes(place._id) ? 'heart' : 'heart-outline'}
                size={24}
                color="#e23744"
              />
            </TouchableOpacity>
            <View style={styles.cardContent}>
              <Text style={styles.name}>{place.name}</Text>
              <Text style={styles.location}>📍 {place.location}</Text>
              <Text style={styles.rating}>⭐ {place.rating.toFixed(1)}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.categoryTitle}>Top Rated</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        {topRated.map((place, index) => (
          <TouchableOpacity
            key={`top-${index}`}
            style={[styles.card, { width: 250, marginRight: 12 }]}
            onPress={() =>
              router.push({ pathname: '/place/[id]', params: { id: place._id } })
            }
          >
            <Image source={{ uri: place.image }} style={styles.image} />
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                toggleFavorite(place._id);
              }}
              style={styles.favoriteIcon}
            >
              <Ionicons
                name={favoriteIds.includes(place._id) ? 'heart' : 'heart-outline'}
                size={24}
                color="#e23744"
              />
            </TouchableOpacity>
            <View style={styles.cardContent}>
              <Text style={styles.name}>{place.name}</Text>
              <Text style={styles.location}>📍 {place.location}</Text>
              <Text style={styles.rating}>⭐ {place.rating.toFixed(1)}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBox: {
    marginBottom: 12,
  },
  logoText: {
    fontSize: 45,
    fontWeight: 'bold',
    color: '#e23744',
  },
  welcome: {
    fontSize: 18,
    marginBottom: 16,
    color: '#333',
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 10,
    color: '#222',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f1f1f1',
    borderRadius: 20,
  },
  categorySelected: {
    backgroundColor: '#e23744',
  },
  categoryText: {
    fontWeight: '600',
    color: '#333',
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    position: 'relative',
  },
  image: {
    height: 180,
    width: '100%',
  },
  favoriteIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 20,
    elevation: 3,
    zIndex: 10,
  },
  cardContent: {
    padding: 12,
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
});
