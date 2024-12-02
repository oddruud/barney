import React, { useState, useEffect } from 'react';
import { StyleSheet, Platform, Animated, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Map } from '@/components/Map';
import { Button } from '@/components/Button';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import { dataProxy } from '@/data/DataProxy';
import { PlannedWalk } from '@/types/PlannedWalk';
import { Text } from '@/components/Themed';
import { IconSymbol } from '@/components/ui/IconSymbol';
import Slider from '@react-native-community/slider';
import { useUser } from '@/contexts/UserContext';
import { haversineDistance } from '@/utils/geoUtils';

export default function SelectWalkInArea({
  minSearchRadius = 1,
  maxSearchRadius = 50,
  initialStartDate = new Date(),
  initialEndDate = new Date(new Date().setDate(new Date().getDate() + 7)),
}) {
  const { user } = useUser();
  const [selectedWalk, setSelectedWalk] = useState<PlannedWalk | null>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(initialStartDate);
  const [endDate, setEndDate] = useState<Date | null>(initialEndDate);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [walks, setWalks] = useState<PlannedWalk[]>([]);
  const [selectedDistance, setSelectedDistance] = useState<number>(10);
  const [mapRegion, setMapRegion] = useState({
    latitude: 41.1579,
    longitude: -8.6291,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      console.log('Location:', location);
      setUserLocation(location);

      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    })();
  }, []);

  useEffect(() => {
    const fetchWalks = async () => {
      const fetchedWalks = await dataProxy.getPlannedWalks();
      setWalks(fetchedWalks);
    };

    fetchWalks();
  }, []);

  useEffect(() => {
    if (selectedWalk) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [selectedWalk]);

  useEffect(() => {
    setStartDate(new Date());
    setEndDate(new Date());
  }, []);

  const handleMarkerPress = (marker: any) => {
    const walk = walks.find(w => w.id === marker.id);
    setSelectedWalk(walk || null);
  };

  const handleCheckOutWalk = () => {
    if (selectedWalk) {
      router.push(`/details/${selectedWalk.id}`);
    }
  };

  const handleStartDateChange = (event: any, date?: Date) => {
    setStartDate(date || null);
  };

  const handleEndDateChange = (event: any, date?: Date) => {
    setEndDate(date || null);
  };

  const calculateDistance = (userLocation: Location.LocationObject | null, walk: PlannedWalk) => {
    if (!userLocation) return Infinity;
    const { latitude, longitude } = userLocation.coords;
    const walkLatitude = walk.latitude;
    const walkLongitude = walk.longitude;
    return haversineDistance(latitude, longitude, walkLatitude, walkLongitude);
  };

  const filteredWalks = walks.filter(walk => {
    const walkDate = new Date(walk.dateTime);
    const distance = calculateDistance(userLocation, walk);
    return (
      walkDate >= new Date() &&
      (!startDate || walkDate >= startDate) &&
      (!endDate || walkDate <= endDate) &&
      distance <= selectedDistance &&
      !walk.joinedUserIds.includes(user.id)
    );
  });

  return (
    <ThemedView style={styles.container}>

      <ThemedView style={styles.dateContainer}>
        <ThemedText>From:</ThemedText>
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display="default"
          onChange={handleStartDateChange}
        />

        <ThemedText>To:</ThemedText>
        <DateTimePicker
          value={endDate || new Date(new Date().setDate(new Date().getDate() + 7))}
          mode="date"
          display="default"
          onChange={handleEndDateChange}
        />
      </ThemedView>

      <ThemedView style={styles.sliderContainer}>
        <ThemedText>Search Radius: {selectedDistance} km</ThemedText>
        <Slider
          style={styles.slider}
          minimumValue={minSearchRadius}
          maximumValue={maxSearchRadius}
          step={1}
          value={selectedDistance}
          onValueChange={setSelectedDistance}
          minimumTrackTintColor="#00796b"
          maximumTrackTintColor="#ccc"
        />
      </ThemedView>

      {Platform.OS !== 'web' && userLocation && (
        <Map
          markers={filteredWalks.map(walk => ({
            id: walk.id,
            coordinate: {
              latitude: walk.latitude,
              longitude: walk.longitude,
            },
            title: walk.location,
            description: walk.description
          }))}
          showUserLocation={true}
          height={240}
          width="100%"
          initialRegion={mapRegion}
          onMarkerPress={handleMarkerPress}
        />
      )}

      {selectedWalk && (
        <Animated.View style={[styles.walkDetails, { opacity: fadeAnim }]}>
          <ThemedView style={styles.walkHeader}>
            <Text style={styles.textBold}>{selectedWalk.location}, {new Date(selectedWalk.dateTime).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })} at {selectedWalk.dateTime.split('T')[1].slice(0, 5)}</Text>
          </ThemedView>
          <ThemedText>{selectedWalk.description}</ThemedText>
          <ThemedText>with {selectedWalk.username}</ThemedText>
          <View style={styles.durationContainer}>
            <IconSymbol name="timer" size={16} color="#333" style={styles.icon} />
            <ThemedText>{selectedWalk.duration * 60} minutes   </ThemedText>
            <IconSymbol name="person" size={16} color="#333" style={styles.icon} />
            <ThemedText>{selectedWalk.joinedUserIds.length} / {selectedWalk.maxParticipants}
            </ThemedText>
          </View>
          <Button
            title="Check out"
            onPress={handleCheckOutWalk}
            style={styles.checkOutButton}
          />
        </Animated.View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00796b',
    marginBottom: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  walkDetails: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  walkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  walkTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  checkOutButton: {
    marginTop: 15,
  },
  profileButton: {
    marginTop: 10,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
  },
  textBold: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  icon: {
    marginRight: 4,
  },
  sliderContainer: {
    marginBottom: 20,
  },
  slider: {
    width: '100%',
    height: 40,
  },
});
