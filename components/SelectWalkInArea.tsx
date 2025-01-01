import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Platform, Animated, View, Modal } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { Map } from '@/components/Map';
import { router, useFocusEffect } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import { PlannedWalk } from '@/types/PlannedWalk';
import { Text } from '@/components/Themed';
import { calculateDistance } from '@/utils/geoUtils';
import WalkDetailsModal from '@/components/modals/WalkDetailsModal';
import { useData } from '@/contexts/DataContext';
import { WalkWithDistance } from '@/types/WalkWithDistance';
import WalkSelect from '@/components/WalkSelect';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/Button';

export default function SelectWalkInArea({
  initialStartDate = new Date(),
  initialEndDate = new Date(new Date().setDate(new Date().getDate() + 7)),
}) {
  const { dataProxy } = useData();
  const { settings } = useSettings();
  const [selectedWalk, setSelectedWalk] = useState<PlannedWalk | null>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [startDate, setStartDate] = useState<Date>(initialStartDate);
  const [endDate, setEndDate] = useState<Date>(initialEndDate);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [walks, setWalks] = useState<PlannedWalk[]>([]);
  const [filteredWalks, setFilteredWalks] = useState<PlannedWalk[]>([]);
  const [walksSortedByDistance, setWalksSortedByDistance] = useState<WalkWithDistance[]>([]);
  const [mapRegion, setMapRegion] = useState({
    latitude: 41.1579,
    longitude: -8.6291,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [scaleAnim] = useState(new Animated.Value(0));
  const [isModalVisible, setModalVisible] = useState(false);


  useFocusEffect(
    useCallback(() => {
      fetchWalks();
    }, [])
  );

  useEffect(() => {
    async function fetchWalks() {
      await getUserLocation();
      await new Promise(resolve => setTimeout(resolve, 100));
      updateWalksSortedByDistance();
    }
    fetchWalks();
  }, [filteredWalks]);

  useEffect(() => {
    setFilteredWalks(filterWalks());
  }, [walks, startDate, endDate, settings.searchRadius]);

  useEffect(() => {
    animateSelectedWalk();
  }, [selectedWalk]);

  const getUserLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return;
    }
    const location = await Location.getCurrentPositionAsync({});
    setUserLocation(location);
    setMapRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
  };

  const fetchWalks = async () => {
    try {
      const fetchedWalks = await dataProxy.getPlannedWalks();
      setWalks(fetchedWalks);
    } catch (error) {
      console.error("Error fetching walks:", error);
    }
  };

  const updateWalksSortedByDistance = () => {
    if (walks.length > 0 && userLocation) {
      const sortedByDistance = filteredWalks.sort((a, b) => calculateDistance(userLocation, a) - calculateDistance(userLocation, b));
      const walksWithDistance = sortedByDistance.map(walk => ({
        ...walk,
        distance: calculateDistance(userLocation, walk),
      }));
      setWalksSortedByDistance(walksWithDistance);
    }
  };

  const animateSelectedWalk = () => {
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
  };

  const handleWalkSelect = (walk: WalkWithDistance) => {
    if (walk) {
      setMapRegion({
        latitude: walk.latitude,
        longitude: walk.longitude,
        latitudeDelta: 0.0922 / 4,
        longitudeDelta: 0.0421 / 4,
      });
    }
  };

  const handleMarkerPress = (marker: any) => {
    const walk = walks.find(w => w.id === marker.id);
    if (walk) {
      router.push(`/details/${walk.id}`);
    }
  };

  const handleCheckOutWalk = () => {
    if (selectedWalk) {
      router.push(`/details/${selectedWalk.id}`);
    }
  };

  const handleStartDateChange = (event: any, date?: Date) => {
    setStartDate(date || new Date());
  };

  const handleEndDateChange = (event: any, date?: Date) => {
    setEndDate(date || new Date());
  };

  const handleChooseWalk = (walk: WalkWithDistance) => {
    if (walk) {
      router.push(`/details/${walk.id}`);
    }
  };

  const filterWalks = (): PlannedWalk[] => {
    return walks.filter(walk => {
      if (userLocation) {
        const walkDate = new Date(walk.dateTime);
        const distance = calculateDistance(userLocation, walk);
        return (
          !walk.cancelled &&
          walkDate >= new Date() &&
          walkDate >= startDate &&
          walkDate <= endDate &&
          distance <= settings.searchRadius
        );
      }
      return false;
    });
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  return (
    <ThemedView style={styles.container}>
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={toggleModal}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>Filters</Text>
            <ThemedView style={styles.dateContainer}>
              <Text style={styles.label}>Between:</Text>
              <DateTimePicker
                value={startDate || new Date()}
                mode="date"
                display="default"
                onChange={handleStartDateChange}
              />
            </ThemedView>
            <ThemedView style={styles.dateContainer}>
              <Text style={styles.label}>And:</Text>
              <DateTimePicker
                value={endDate || new Date(new Date().setDate(new Date().getDate() + 7))}
                mode="date"
                display="default"
                onChange={handleEndDateChange}
              />
            </ThemedView>
            <Button title="Close" onPress={toggleModal} />
          </View>
        </View>
      </Modal>

      {userLocation && (
        <Map
          markers={filteredWalks.map(walk => ({
            id: walk.id,
            coordinate: {
              latitude: walk.latitude,
              longitude: walk.longitude,
            },
            title: walk.fullName,
            description: walk.description,
            image: walk.profileImage,
          }))}
          showUserLocation={true}
          height="100%"
          width="100%"
          style={styles.map}
          initialRegion={mapRegion}
          onMarkerPress={handleMarkerPress}
        />
      )}
      <Button style={styles.button} textStyle={styles.buttonText} title="Open Filters" onPress={toggleModal} />
      <WalkSelect walks={walksSortedByDistance} onWalkSelect={handleWalkSelect} onChooseWalk={handleChooseWalk} />
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
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    width: 100,
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
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
    backgroundColor: 'rgba(0,0,0,0.0)',
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
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    padding: 10,
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
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  button: {
    position: 'absolute',
    bottom: 190,
    padding: 10,
    zIndex: 1000,
    alignSelf: 'center',
    textAlign: 'center',
  },
  buttonText: {
    fontSize: 12,
    color: '#fff',
  },
});
