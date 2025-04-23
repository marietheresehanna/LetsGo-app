import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Alert,
} from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '@/constants/env';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

export default function PlaceDetails() {
  const { id } = useLocalSearchParams();
  const [place, setPlace] = useState<any>(null);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thankYou, setThankYou] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const [username, setUsername] = useState('');
  const [happyHourRemaining, setHappyHourRemaining] = useState('');
  const [userLocation, setUserLocation] = useState<any>(null);
  const router = useRouter();

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371e3;
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);
    const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleCheckIn = async () => {
    if (!userLocation || !place) {
      Alert.alert('Error', 'Location data is missing.');
      return;
    }

    const distance = getDistance(userLocation.latitude, userLocation.longitude, place.latitude, place.longitude);
    const maxDistance = 100;

    if (distance > maxDistance) {
      Alert.alert('Too far', `You are ${Math.round(distance)} meters away. Get closer to check in.`);
      return;
    }

    try {
      const userId = await AsyncStorage.getItem('userId');
      const response = await axios.post(`${API_BASE_URL}/users/check-in`, {
        userId,
        placeId: place._id,
      });
      Alert.alert('Check-In Successful', `+${response.data.pointsEarned} points earned!`);
    } catch (error) {
      Alert.alert('Check-In Failed', error.response?.data?.message || 'Try again later.');
    }
  };

  const getHappyHourEndDate = (hhmm) => {
    if (!hhmm) return null;
    const [hours, minutes] = hhmm.split(':').map(Number);
    const end = new Date();
    end.setHours(hours, minutes, 0, 0);
    return end;
  };

  const submitReview = async () => {
    if (!username) {
      alert('You must be logged in to leave a review.');
      return;
    }
    if (!comment || !rating) return;
    try {
      setIsSubmitting(true);
      const res = await axios.post(`${API_BASE_URL}/api/places/${id}/reviews`, {
        comment,
        rating: parseFloat(rating),
        username,
      });
      const newReview = res.data.place.reviews[res.data.place.reviews.length - 1];
      setPlace((prev: any) => ({
        ...prev,
        reviews: [...(prev.reviews || []), newReview],
      }));
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

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/places/${id}`);
        setPlace(res.data);
      } catch (err) {
        console.error('❌ Place fetch failed:', err);
      }
    };

    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const res = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const usernameFromAPI = res.data.username || res.data.name || '';
          setUsername(usernameFromAPI);
        } else {
          setUsername('');
        }
      } catch (err) {
        console.error('❌ Error fetching user profile:', err);
        setUsername('');
      }
    };

    const fetchUserLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to check in.');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation(location.coords);
    };

    fetchDetails();
    fetchUser();
    fetchUserLocation();
  }, [id]);

  useEffect(() => {
    const updateTimer = () => {
      const start = place?.happyHourStart ? getHappyHourEndDate(place.happyHourStart) : null;
      const end = place?.happyHourEnd ? getHappyHourEndDate(place.happyHourEnd) : null;
      const now = new Date();

      if (!start || !end) {
        setHappyHourRemaining('');
        return;
      }

      if (now < start) {
        const diff = start.getTime() - now.getTime();
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff / (1000 * 60)) % 60);
        const s = Math.floor((diff / 1000) % 60);
        setHappyHourRemaining(`🕒 Starts in: ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      } else if (now >= start && now <= end) {
        const diff = end.getTime() - now.getTime();
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff / (1000 * 60)) % 60);
        const s = Math.floor((diff / 1000) % 60);
        setHappyHourRemaining(`⏰ Ends in: ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      } else {
        setHappyHourRemaining('❌ Happy Hour ended');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [place?.happyHourStart, place?.happyHourEnd]);

  if (!place) return <Text style={styles.loading}>Loading...</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: place.image }} style={styles.image} />

      <Text style={styles.title}>{place.name}</Text>
      <Text style={styles.subtitle}>📍 {place.location}</Text>
      <Text style={styles.subtitle}>⭐ {place.rating.toFixed(1)}</Text>

      {happyHourRemaining ? (
        <View style={styles.happyHourBox}>
          <Text style={styles.happyHourText}>{happyHourRemaining}</Text>
        </View>
      ) : null}

      <Text style={styles.section}>Type: {place.type?.join(', ')}</Text>
      <Text style={styles.section}>Tags: {place.tags?.join(', ')}</Text>

      <TouchableOpacity
        style={styles.locationButton}
        onPress={() =>
          router.push({
            pathname: '/place/MapScreen',
            params: {
              latitude: place.latitude?.toString() || '0',
              longitude: place.longitude?.toString() || '0',
              name: place.name,
            },
          })
        }
      >
        <Text style={styles.locationText}>View on Map</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.checkInButton} onPress={handleCheckIn}>
        <Text style={styles.checkInButtonText}>Check In</Text>
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

      {username ? (
        <>
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
        </>
      ) : (
        <Text style={{ color: '#666', marginTop: 10 }}>You must be logged in to leave a review.</Text>
      )}
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
  happyHourBox: {
    backgroundColor: '#ffe4b5',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  happyHourText: {
    fontWeight: '600',
    color: '#d35400',
    fontSize: 16,
    textAlign: 'center',
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
  checkInButton: {
    backgroundColor: '#e23744',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  checkInButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
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
