import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, StyleSheet, ScrollView, TouchableOpacity
} from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '@/constants/env';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function PlaceDetails() {
  const { id } = useLocalSearchParams();
  const [place, setPlace] = useState<any>(null);
  const router = useRouter();


  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/places/${id}`)
      .then((res) => setPlace(res.data))
      .catch((err) => console.error('❌ Place fetch failed:', err));
  }, [id]);

  console.log('🆔 Place ID:', id);

  if (!place) return <Text style={styles.loading}>Loading...</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: place.image }} style={styles.image} />

      <Text style={styles.title}>{place.name}</Text>
      <Text style={styles.subtitle}>📍 {place.location}</Text>
      <Text style={styles.subtitle}>⭐ {place.rating.toFixed(1)}</Text>

      <Text style={styles.section}>Type: {place.type?.join(', ')}</Text>
      <Text style={styles.section}>Tags: {place.tags?.join(', ')}</Text>

      <TouchableOpacity style={styles.locationButton}>
        <Text style={styles.locationText}>View on Map (coming soon)</Text>
      </TouchableOpacity>
      <TouchableOpacity
  style={{ position: 'absolute', top: 40, right: 20, zIndex: 10 }}
  onPress={() => router.back()}
>
  <Ionicons name="close" size={30} color="#e23744" />
</TouchableOpacity>


      <Text style={styles.section}>Reviews:</Text>
      {place.reviews?.length ? (
        place.reviews.map((rev: any, i: number) => (
          <View key={i} style={styles.review}>
            <Text style={styles.reviewer}>{rev.username}:</Text>
            <Text>{rev.comment} (⭐ {rev.rating})</Text>
          </View>
        ))
      ) : (
        <Text style={{ color: '#666' }}>No reviews yet.</Text>
      )}

      {/* Add review UI comes next step */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
    color: '#e23744',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 6,
    color: '#444',
  },
  section: {
    marginTop: 16,
    fontWeight: '600',
    fontSize: 16,
  },
  review: {
    backgroundColor: '#f4f4f4',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  reviewer: {
    fontWeight: '600',
    marginBottom: 2,
  },
  locationButton: {
    marginTop: 16,
    backgroundColor: '#e23744',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  locationText: {
    color: '#fff',
    fontWeight: '600',
  },
  loading: {
    marginTop: 50,
    textAlign: 'center',
  },
});
