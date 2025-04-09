import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '@/constants/env';

type Place = {
  name: string;
  image: string;
  location: string;
  rating: number;
};

export default function ExploreScreen() {
  const [query, setQuery] = useState('');
  const [allPlaces, setAllPlaces] = useState<Place[]>([]);
  const [filtered, setFiltered] = useState<Place[]>([]);

  const normalize = (str: string) =>
    str
      .toLowerCase()
      .normalize('NFD')                 // Breaks letters + accents
      .replace(/[\u0300-\u036f]/g, '')  // Removes accents
      .replace(/[^a-z0-9 ]/gi, '');     // Removes symbols like apostrophes
  

  const handleSearch = (text: string) => {
    setQuery(text);
    const normalizedQuery = normalize(text);
    const filteredResults = allPlaces.filter((place) =>
      normalize(place.name).includes(normalizedQuery)
    );
    setFiltered(filteredResults);
  };

  useEffect(() => {
    axios.get<Place[]>(`${API_BASE_URL}/api/places`).then((res) => {
      setAllPlaces(res.data);
      setFiltered(res.data);
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
          <View key={index} style={styles.card}>
            <Image source={{ uri: place.image }} style={styles.image} />
            <View style={styles.content}>
              <Text style={styles.name}>{place.name}</Text>
              <Text style={styles.info}>
                ⭐ {place.rating.toFixed(1)} ‧ 📍 {place.location}
              </Text>
            </View>
          </View>
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
