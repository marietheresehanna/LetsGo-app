import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

export default function MapScreen() {
  const { latitude, longitude, name } = useLocalSearchParams();
  const router = useRouter();

  const [userLocation, setUserLocation] = useState<null | { latitude: number; longitude: number }>(null);
  const [showDirections, setShowDirections] = useState(false);

  useEffect(() => {
    let watcher: Location.LocationSubscription;
    const startWatching = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      watcher = await Location.watchPositionAsync(
        { 
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,         // Update every second
          distanceInterval: 1         // Or every 1 meter moved
        },
        (location) => {
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      );
  
      return () => watcher.remove(); // Clean up on unmount
    };
  
    startWatching();

    return () => {
      watcher?.remove();  
    };
  }, []);

  const destination = {
    latitude: parseFloat(latitude as string),
    longitude: parseFloat(longitude as string),
  };

  console.log('📍 userLocation:', userLocation);
  console.log('🎯 destination:', destination);
  console.log('🚦 showDirections:', showDirections);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: destination.latitude,
          longitude: destination.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {userLocation && (
          <>
              <Marker coordinate={userLocation} title="You" pinColor="blue" />

              {showDirections && (
                <MapViewDirections
                origin={userLocation}
                destination={destination}
                apikey="AIzaSyBBcyzVsDoscHLMZlOtfbYnh10MJfDiW74"
                strokeWidth={4}
                strokeColor="#e23744"
                onError={(err) => console.log('❌ Directions error:', err)}
                onReady={(result) => console.log('✅ Route ready:', result.distance, 'km')}
                />
              )}
          </>
        )}
        <Marker coordinate={destination} title={name as string} pinColor="red" tracksViewChanges={false} />
      </MapView>

      <TouchableOpacity
        style={styles.directionsButton}
        onPress={() => setShowDirections(true)}
      >
        <Text style={styles.directionsText}>Show Directions</Text>
      </TouchableOpacity>


      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 20,
    elevation: 5,
  },
  directionsButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#e23744',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    elevation: 4,
  },
  directionsText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
