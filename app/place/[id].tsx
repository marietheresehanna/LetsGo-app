import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, TextInput, Animated,
} from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '@/constants/env';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PlaceDetails() {
  const { id } = useLocalSearchParams();
  const [place, setPlace] = useState<any>(null);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thankYou, setThankYou] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const [username, setUsername] = useState('Guest');
  const router = useRouter();

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/places/${id}`)
      .then((res) => setPlace(res.data))
      .catch((err) => console.error('❌ Place fetch failed:', err));
  }, [id]);

  const submitReview = async () => {
    if (!comment || !rating) return;
    try {
      setIsSubmitting(true);
      const res = await axios.post<{ place: { reviews: any[] } }>(
        `${API_BASE_URL}/api/places/${id}/reviews`,
        {
          comment,
          rating: parseFloat(rating),
          username,
        }
      );
      
      const newReview = res.data.place.reviews[res.data.place.reviews.length - 1];
      setPlace((prev: any) => ({ ...prev, reviews: [...(prev.reviews || []), newReview] }));

      setComment('');
      setRating('');

      setThankYou(true);
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }).start(() => setThankYou(false));
        }, 2500);
      });
    } catch (err) {
      console.error('❌ Review failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

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

      <Text style={styles.section}>Leave a Review:</Text>

      {thankYou && (
        <Animated.Text style={[styles.thankYou, { opacity: fadeAnim }]}>🎉 Thank you for your review!</Animated.Text>
      )}

      <TextInput
        value={comment}
        onChangeText={setComment}
        placeholder="Your comment"
        style={styles.input}
      />

      <TextInput
        value={rating}
        onChangeText={setRating}
        placeholder="Rating (1-5)"
        keyboardType="numeric"
        style={styles.input}
      />

      <TouchableOpacity
        disabled={isSubmitting}
        onPress={submitReview}
        style={{
          backgroundColor: '#e23744',
          padding: 12,
          borderRadius: 10,
          marginTop: 12,
          alignItems: 'center',
          opacity: isSubmitting ? 0.6 : 1,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '600' }}>
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </Text>
      </TouchableOpacity>
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
  input: {
    backgroundColor: '#f4f4f4',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  thankYou: {
    textAlign: 'center',
    color: 'green',
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 10,
  },
});