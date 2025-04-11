import React, { useState, useEffect } from 'react';
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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';




type Place = {
  _id: string;
  name: string;
  image: string;
  location: string;
  rating: number;
  type?: string[];
  tags?: string[];
};


export default function ExploreScreen() {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const [allPlaces, setAllPlaces] = useState<Place[]>([]);
  const [filtered, setFiltered] = useState<Place[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const toggleFavorite = async (placeId: string) => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;
  
    const isFav = favoriteIds.includes(placeId);
  
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
  };
  


  const normalize = (str: string) =>
    str
      .toLowerCase()
      .normalize('NFD')                 // Breaks letters + accents
      .replace(/[\u0300-\u036f]/g, '')  // Removes accents
      .replace(/[^a-z0-9 ]/gi, '');     // Removes symbols like apostrophes
  

  const handleSearch = (text: string) => {
    setQuery(text);
    const normalizedQuery = normalize(text);
    const filteredResults = allPlaces.filter((place) => {
      const nameMatch = normalize(place.name).includes(normalizedQuery);
      const typeMatch = place.type?.some((t) =>
        normalize(t).includes(normalizedQuery)
      );
      const tagMatch = place.tags?.some((t) =>
        normalize(t).includes(normalizedQuery)
      );
    
      return nameMatch || typeMatch || tagMatch;
    });
    
    setFiltered(filteredResults);
  };

  useEffect(() => {
    const fetchFavorites = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
    
      const res = await axios.get<Place[]>(`${API_BASE_URL}/api/auth/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    
      const ids = res.data.map((place) => place._id);
      setFavoriteIds(ids);
    };
    
  
    axios.get<Place[]>(`${API_BASE_URL}/api/places`).then((res) => {
      setAllPlaces(res.data);
      setFiltered(res.data);
      fetchFavorites();
    });
  }, []);
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explore</Text>

      <TextInput
        placeholder="Search for cafes, pubs, vibes..."
        style={styles.search}
        value={query}
        onChangeText={handleSearch}
      />

<ScrollView showsVerticalScrollIndicator={false}>
  {filtered.map((place, index) => (
    <TouchableOpacity
      key={index}
      style={styles.card}
      onPress={() =>
        router.push({ pathname: '/place/[id]', params: { id: place._id } })
      }
    >
      <Image source={{ uri: place.image }} style={styles.image} />

      <View style={styles.content}>
        <Text style={styles.name}>{place.name}</Text>
        <Text style={styles.info}>
          ⭐ {place.rating.toFixed(1)} ‧ 📍 {place.location}
        </Text>

        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation(); // ✅ prevent navigation when tapping heart
            toggleFavorite(place._id);
          }}
          style={{ position: 'absolute', top: 10, right: 10 }}
        >
          <Ionicons
            name={
              favoriteIds.includes(place._id) ? 'heart' : 'heart-outline'
            }
            size={24}
            color="#e23744"
          />
        </TouchableOpacity>
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
