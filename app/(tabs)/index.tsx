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
import { API_BASE_URL } from '@/constants/env';
import { useRouter } from 'expo-router';

const categories = ["Cafe", "Pub", "Restaurant", "Lounge"];

type Place = {
  _id: string;
  name: string;
  image: string;
  location: string;
  rating: number;
  type?: string[];
  tags?: string[];
};

export default function HomeScreen() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/places`)
      .then((res: any) => setPlaces(res.data))
      .catch((err) => console.error("Error fetching places:", err))
      .then(() => setLoading(false))
.catch((err) => {
       console.error("Error fetching places:", err);
       setLoading(false);
});

  }, []);

  const getTopRated = (): Place[] => {
    return [...places].sort((a, b) => b.rating - a.rating).slice(0, 5);
  };

  const getRecommended = (): Place[] => {
    return [...places].sort(() => 0.5 - Math.random()).slice(0, 5);
  };

  const filterByCategory = (category: string): Place[] => {
    return places.filter(p => p.type?.includes(category));
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#e23744" />;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.logo}>LetsGo</Text>

      <Text style={styles.sectionTitle}>Categories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rowScroll}>
        {categories.map((cat, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.categoryCard}
            onPress={() => router.push({ pathname: '/explore', params: { category: cat } })}
          >
            <Text style={styles.categoryText}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Top Rated</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rowScroll}>
        {getTopRated().map((place) => (
          <TouchableOpacity
            key={place._id}
            style={styles.placeCard}
            onPress={() => router.push({ pathname: '/place/[id]', params: { id: place._id } })}
          >
            <Image source={{ uri: place.image }} style={styles.image} />
            <Text style={styles.placeName}>{place.name}</Text>
            <Text style={styles.placeInfo}>⭐ {place.rating} ‧ {place.location}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Recommended for You</Text>
      {getRecommended().map((place) => (
        <TouchableOpacity
          key={place._id}
          style={styles.recommendCard}
          onPress={() => router.push({ pathname: '/place/[id]', params: { id: place._id } })}
        >
          <Image source={{ uri: place.image }} style={styles.imageHorizontal} />
          <View style={{ flex: 1, paddingLeft: 12 }}>
            <Text style={styles.placeName}>{place.name}</Text>
            <Text style={styles.placeInfo}>⭐ {place.rating} ‧ {place.location}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  logo: { fontSize: 26, fontWeight: 'bold', color: '#e23744', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginVertical: 12, color: '#333' },
  rowScroll: { marginBottom: 10 },
  categoryCard: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#f1f1f1',
    borderRadius: 20,
    marginRight: 10,
  },
  categoryText: { fontSize: 14, fontWeight: '500', color: '#444' },
  placeCard: {
    width: 160,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  image: { width: '100%', height: 100 },
  placeName: { fontSize: 15, fontWeight: '600', marginTop: 8, marginHorizontal: 8 },
  placeInfo: { fontSize: 13, color: '#666', marginHorizontal: 8, marginBottom: 8 },
  recommendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  imageHorizontal: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
});