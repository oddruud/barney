import React, { useState, useEffect } from 'react';
import { StyleSheet, Platform, Animated, View, Modal } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Map } from '@/components/Map';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import { dataProxy } from '@/data/DataProxy';
import { PlannedWalk } from '@/types/PlannedWalk';
import { Text } from '@/components/Themed';
import Slider from '@react-native-community/slider';
import { useUser } from '@/contexts/UserContext';
import { haversineDistance } from '@/utils/geoUtils';
import WalkDetailsModal from '@/components/modals/WalkDetailsModal';

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
  const [scaleAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
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
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0);
    }
  }, [selectedWalk]);

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
        <Text style={styles.label}>From:</Text>
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display="default"
          onChange={handleStartDateChange}
        />

        <Text style={styles.label}>To:</Text>
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
          height="100%"
          width="100%"
          initialRegion={mapRegion}
          onMarkerPress={handleMarkerPress}
        />
      )}

      <WalkDetailsModal
        visible={!!selectedWalk}
        walk={selectedWalk}
        onClose={() => setSelectedWalk(null)}
        onCheckOut={() => {
          handleCheckOutWalk();
          setSelectedWalk(null);
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#e9eae4',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    backgroundColor: '#e9eae4',
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
    backgroundColor: '#ffffff',
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
    backgroundColor: '#e9eae4',
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
    backgroundColor: '#e9eae4',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButton: {
    marginTop: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
});
