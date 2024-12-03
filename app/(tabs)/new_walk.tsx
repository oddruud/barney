import React from 'react';
import { useState, useEffect } from 'react';
import { StyleSheet, Platform, ScrollView, View, Image, Modal, TextInput, FlatList, TouchableOpacity, Text } from 'react-native';
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
import { UserDetails } from '@/types/UserDetails';
import { useFocusEffect } from '@react-navigation/native';

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
  const [invitedUsers, setInvitedUsers] = useState<UserDetails[]>([]); // New state for invited users
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Reset state variables to their initial values
  useFocusEffect(
    React.useCallback(() => {
      // Reset state variables to their initial values
      setDate(new Date());
      setDuration('30');
      setDescription('');
      setLocation({
        latitude: 41.1579,
        longitude: -8.6291,
        title: '',
        description: ''
      });
      setShowDatePicker(false);
      setIsLoadingLocation(true);
      setGroupSize('2');
      setInvitedUsers([]);
      setIsModalVisible(false);
      setSearchQuery('');
      setSearchResults([]);
      setIsLoading(true);
      
      // Return a cleanup function if necessary
      return () => {
        // Any cleanup logic if needed
      };
    }, [])
  );

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
        
        // TODO: fetch address only if location changed
        //
      }
      setIsLoadingLocation(false);
    })();
  }, [isLoading, location]);



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
    const invitedUserIds = invitedUsers.map(user => user.id); // Extract user IDs
    const walk = await dataProxy.createWalk(
      user?.id ?? 0,
      date,
      parseInt(duration) / 60,
      parseInt(groupSize),
      description,
      locationName,
      location,
      invitedUserIds // Pass the invited user IDs
    );

    // Navigate to the new walk details page
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
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    const allUsers = await dataProxy.getAllUsers();

    const results = allUsers.filter(user => user.fullName.toLowerCase().includes(query.toLowerCase()));
    setSearchResults(results);
  };

  const inviteUser = () => {
    setIsModalVisible(true);
    setSearchQuery('');
    setSearchResults([]);
  };

  const selectUser = (user: UserDetails) => {
    if (!invitedUsers.some(invitedUser => invitedUser.id === user.id)) {
      setInvitedUsers([...invitedUsers, user]);
    }
    setSearchQuery('');
    setIsModalVisible(false);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
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

        {/* Invited Users List */}
        <ThemedText style={styles.label}>Invited Users</ThemedText>
        <View style={styles.invitedUsersContainer}>
          {invitedUsers.map(user => (
            <TouchableOpacity
              key={user.id}
              onPress={() => setInvitedUsers(invitedUsers.filter(invitedUser => invitedUser.id !== user.id))}
            >
              <Image
                source={{ uri: user.profileImage }}
                style={styles.profileImage}
              />
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

   

      {/* Invite User and Submit Buttons at the bottom */}
      <View style={styles.buttonRow}>
        <Button
          onPress={inviteUser}
          title="Invite User"
          style={styles.inviteButton}
        />
        <Button
          onPress={async () => {
            await fetchAddress(location.latitude, location.longitude);
            createWalk();
          }}
          title="Schedule Walk"
          style={styles.submitButton}
        />
      </View>

   {/* Invite User Modal */}
   <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a user"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => selectUser(item)}>
                <Text style={styles.userItem}>{item.fullName}</Text>
              </TouchableOpacity>
            )}
          />
          <Button style={styles.modalCloseButton} title="Close" onPress={() => setIsModalVisible(false)} />
        </View>
      </Modal>


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
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00796b',
    marginBottom: 12,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
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
    flex: 1,
    marginLeft: 10,
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  descriptionInput: {
    height: 40,
    textAlignVertical: 'top',
  },
  inviteButton: {
    flex: 1,
    marginRight: 10,
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 80,
  },
  invitedUsersContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 25,
    marginRight: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  searchInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    width: '80%',
    marginBottom: 20,
    marginTop: 70,
  },
  userItem: {
    padding: 10,
    backgroundColor: '#f5f5f5',
    marginVertical: 5,
    width: '100%',
    textAlign: 'center',
    borderRadius: 8,
  },
  modalCloseButton: {
    marginTop: 20,
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 70,
  },
});