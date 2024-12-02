import { StyleSheet, Platform, Image, Animated, TouchableOpacity, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Map } from '@/components/Map';
import { useState, useEffect } from 'react';
import { Button } from '@/components/Button';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import { dataProxy } from '@/data/DataProxy'; // Import the function
import { PlannedWalk } from '@/types/PlannedWalk';
import { Text } from '@/components/Themed';
import { IconSymbol } from '@/components/ui/IconSymbol';


export default function SelectWalkScreen() {
  const [selectedWalk, setSelectedWalk] = useState<PlannedWalk | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0)); // Initial opacity value
  const [walks, setWalks] = useState<PlannedWalk[]>([]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);
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
        duration: 500, // Duration of the fade-in effect
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0); // Reset opacity when no walk is selected
    }
  }, [selectedWalk]);

  const initialRegion = userLocation
    ? {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }
    : {
        latitude: 41.1579, // Default latitude
        longitude: -8.6291, // Default longitude
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };

  const handleMarkerPress = (marker: any) => {
    const walk = walks.find(w => w.id === marker.id);
    setSelectedWalk(walk || null);
  };

  const handleJoinWalk = () => {
    if (selectedWalk) {
      // TODO: Handle joining the walk
      console.log('Joining walk:', selectedWalk);
      router.back();
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    setSelectedDate(date || null);
  };

  const handleShowUserProfile = () => {
    if (selectedWalk) {
      // TODO: Navigate to the user's profile
      console.log('Showing profile for:', selectedWalk.username);
    }
  };

  const handleStartDateChange = (event: any, date?: Date) => {
    setStartDate(date || null);
  };

  const handleEndDateChange = (event: any, date?: Date) => {
    setEndDate(date || null);
  };

  const filteredWalks = walks.filter(walk => {
    const walkDate = new Date(walk.dateTime);
    return (
      (!startDate || walkDate >= startDate) &&
      (!endDate || walkDate <= endDate)
    );
  });

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Join a Walk</ThemedText>

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
          value={endDate || new Date()}
          mode="date"
          display="default"
          onChange={handleEndDateChange}
        />
      </ThemedView>

      {Platform.OS !== 'web' && (
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
          height={300}
          initialRegion={initialRegion}
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
            title="Join"
            onPress={handleJoinWalk}
            style={styles.joinButton}
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
    marginTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00796b', // Teal color
    marginBottom: 16,
    marginTop: 16,
    textAlign: 'center', // Center the title
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
  joinButton: {
    marginTop: 15,
    width: 100,
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
});
