import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '@/constants/env';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

type Place = {
  _id: string;
  name: string;
  image: string;
  location: string;
  rating: number;
  type?: string[];
  tags?: string[];
  latitude?: number;
  longitude?: number;
};

export default function ExploreScreen() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const router = useRouter();
  const [allPlaces, setAllPlaces] = useState<Place[]>([]);
  const [filtered, setFiltered] = useState<Place[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const { category } = useLocalSearchParams();

  useEffect(() => {
    if (category && typeof category === 'string') {
      setSelectedCategory(category);
      fetchByCategory(category);
    }
  }, [category]);

  const fetchFavorites = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;

    const res = await axios.get<Place[]>(`${API_BASE_URL}/api/auth/favorites`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const ids = res.data.map((place) => place._id);
    setFavoriteIds(ids);
  };

  useEffect(() => {
    axios.get<Place[]>(`${API_BASE_URL}/api/places`).then((res) => {
      setAllPlaces(res.data);
      setFiltered(res.data);
      fetchFavorites();
    });
  }, []);

  // 🔥 Sync favorites when screen gains focus
  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, [])
  );

  const toggleFavorite = async (placeId: string) => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      alert("You must be logged in to favorite places.");
      return;
    }

    try {
      const isFav = favoriteIds.includes(placeId);

      if (isFav) {
        await axios.delete(`${API_BASE_URL}/api/auth/favorites/${placeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API_BASE_URL}/api/auth/favorites/${placeId}`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      await fetchFavorites();  // 🔄 Sync after toggle
    } catch (err) {
      console.error("❌ Favorite toggle failed:", err);
    }
  };

  const normalize = (str: string) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9 ]/gi, '');

  const handleSearch = (text: string) => {
    setQuery(text);
    const normalizedQuery = normalize(text);
    const filteredResults = allPlaces.filter((place) => {
      const nameMatch = normalize(place.name).includes(normalizedQuery);
      const locationMatch = normalize(place.location).includes(normalizedQuery);
      const typeMatch = place.type?.some((t) => normalize(t).includes(normalizedQuery));
      const tagMatch = place.tags?.some((t) => normalize(t).includes(normalizedQuery));
      return nameMatch || locationMatch || typeMatch || tagMatch;
    });
    setFiltered(filteredResults);
  };

  const fetchByCategory = async (category: string) => {
    try {
      setSelectedCategory(category);
      const res = await axios.get<Place[]>(`${API_BASE_URL}/api/places?type=${category}`);
      setAllPlaces(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error('❌ Failed to fetch by category:', err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explore</Text>

      <TextInput
        placeholder="Search for cafes, pubs, vibes..."
        style={styles.search}
        value={query}
        onChangeText={handleSearch}
      />

      <View style={styles.categoryRow}>
        {['cafe', 'restaurant', 'pub', 'lounge'].map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => fetchByCategory(cat)}
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
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {filtered.map((place, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
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

            <View style={styles.content}>
              <Text style={styles.name}>{place.name}</Text>
              <Text style={styles.info}>
                ⭐ {place.rating.toFixed(1)} ‧ 📍 {place.location}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#e23744',
    marginBottom: 10,
  },
  search: {
    backgroundColor: '#f4f4f4',
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f4f4f4',
  },
  categorySelected: {
    backgroundColor: '#e23744',
  },
  categoryText: {
    color: '#222',
    fontWeight: '600',
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
    position: 'relative',
  },
  image: {
    height: 180,
    width: '100%',
  },
  favoriteIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 20,
    elevation: 3,
    zIndex: 10,
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
