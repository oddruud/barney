import { useState, useEffect } from 'react';
import { StyleSheet, Platform, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedTextInput } from '@/components/ThemedTextInput';
import { Button } from '@/components/Button';
import { Map } from '@/components/Map';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { dataProxy } from '@/data/DataProxy';
import { useUser } from '@/contexts/UserContext';

export default function NewWalkScreen() {
  const { user } = useUser();
  const [date, setDate] = useState(new Date());
  const [duration, setDuration] = useState('30'); // in minutes
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState({
    latitude: 41.1579,
    longitude: -8.6291,
    title: '',
    description: ''
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [groupSize, setGroupSize] = useState('2'); // Default group size

  useEffect(() => {
    (async () => {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        // Get current location
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation({
          ...location,
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
        await fetchAddress(currentLocation.coords.latitude, currentLocation.coords.longitude);
      }
      setIsLoadingLocation(false);
    })();
  }, []);

  const fetchAddress = async (latitude: number, longitude: number) => {
    try {
      const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
      console.log("address: ", address);
      setLocation((prevLocation) => ({
        ...prevLocation,
        title: address.name || '',
        description: `${address.street}, ${address.city}, ${address.region}, ${address.country}`
      }));
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  async function createWalk() {
    const locationName = location.title;
    const walk = await dataProxy.createWalk(user?.id ?? 0, date, parseInt(duration) / 60, parseInt(groupSize), description, locationName, location);

    //navigate to the new walk details page
    if (walk) {
      router.push(`/details/${walk.id}`);
    }
  }

  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setLocation({
      ...location,
      latitude,
      longitude,
    });
    await fetchAddress(latitude, longitude);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        <ThemedText style={styles.title}>New Walk</ThemedText>

        {/* Time Picker */}
        <ThemedText style={styles.label}>Start Time</ThemedText>
        <Button 
          onPress={() => setShowDatePicker(true)}
          title={date.toLocaleString()}
        />
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="datetime"
            onChange={handleDateChange}
          />
        )}

        {/* Duration Input */}
        <ThemedText style={styles.label}>Duration (minutes)</ThemedText>
        <ThemedTextInput
          style={styles.input}
          value={duration}
          onChangeText={setDuration}
          keyboardType="numeric"
          placeholder="Enter duration in minutes"
        />

        {/* Walk Description */}
        <ThemedText style={styles.label}>Description</ThemedText>
        <ThemedTextInput
          style={[styles.input, styles.descriptionInput]}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter walk description"
          multiline
        />

        {/* Group Size Input */}
        <ThemedText style={styles.label}>Group Size</ThemedText>
        <ThemedTextInput
          style={styles.input}
          value={groupSize}
          onChangeText={setGroupSize}
          keyboardType="numeric"
          placeholder="Enter group size"
        />

        {/* Location Map */}
        <ThemedText style={styles.label}>Location</ThemedText>
        {Platform.OS !== 'web' && (
          isLoadingLocation ? (
            <ThemedText>Loading location...</ThemedText>
          ) : (
            <Map
              showUserLocation={true}
              markers={[{
                id: '1',
                coordinate: {
                  latitude: location.latitude,
                  longitude: location.longitude,
                },
                title: location.title || 'Selected Location',
                description: location.description || 'Tap to set details'
              }]}
              height={200}
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.010,
                longitudeDelta: 0.010,
              }}
              onPress={handleMapPress}
              onMarkerPress={(marker) => {
                setLocation({
                  ...location,
                  latitude: marker.coordinate.latitude,
                  longitude: marker.coordinate.longitude,
                });
              }}
            />
          )
        )}

        {/* Submit Button */}
        <Button
          onPress={createWalk}
          title="Schedule Walk"
          style={styles.submitButton}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    marginTop: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00796b',
    marginBottom: 12,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 4,
    color: '#555',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 60,
  },
  descriptionInput: {
    height: 40,
    textAlignVertical: 'top',
  },
});
