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

export default function NewWalkScreen() {
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
  const [groupSize, setGroupSize] = useState('1'); // Default group size

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
      }
      setIsLoadingLocation(false);
    })();
  }, []);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleSubmit = () => {
    // TODO: Save walk data
    console.log({ date, duration, description, location });
    router.back();
  };

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setLocation({
      ...location,
      latitude,
      longitude,
    });
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
              markers={[{
                id: '1',
                coordinate: {
                  latitude: location.latitude,
                  longitude: location.longitude,
                },
                title: location.title || 'Selected Location',
                description: location.description || 'Tap to set details'
              }]}
              height={240}
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
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
          onPress={handleSubmit}
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
    padding: 30,
    backgroundColor: '#f5f5f5',
    marginTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00796b', // Teal color
    marginBottom: 16,
    textAlign: 'center', // Center the title
  },
  label: {
    fontSize: 18,
    marginTop: 15,
    marginBottom: 5,
    color: '#555',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 10,
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
    paddingVertical: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 60,
  },
  descriptionInput: {
    height: 80,
    textAlignVertical: 'top',
  },
});
