import React, { useRef, useEffect } from 'react';
import { useState } from 'react';
import { StyleSheet, Platform, ScrollView, View, TouchableOpacity, Text, Animated } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedTextInput } from '@/components/ThemedTextInput';
import { Button } from '@/components/Button';
import { Map } from '@/components/Map';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { useUser } from '@/contexts/UserContext';
import { useData } from '@/contexts/DataContext';
import { UserDetails } from '@/types/UserDetails';
import { useFocusEffect } from '@react-navigation/native';
import { Easing } from 'react-native';
import SelectOnMapModal from '@/components/modals/SelectOnMapModal';
import InviteUsersModal from '@/components/modals/InviteUsersModal';
import { fetchAddress } from '@/utils/geoUtils';

export default function NewWalkScreen() {
  const { user } = useUser();
  const { dataProxy } = useData();
  const [date, setDate] = useState(new Date());
  const [duration, setDuration] = useState('30'); // in minutes
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState({
    latitude: 40.7128,
    longitude: -74.0060,
    title: '',
    description: ''
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [groupSize, setGroupSize] = useState('2'); // Default group size
  const [invitedUsers, setInvitedUsers] = useState<UserDetails[]>([]); // New state for invited users
  const [isInviteUserModalVisible, setIsInviteUserModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSelectOnMapModalVisible, setIsSelectOnMapModalVisible] = useState(false); // New state for modal visibility
  const [allUsers, setAllUsers] = useState<UserDetails[]>([]);

  const buttonRowAnimation = useRef(new Animated.Value(100)).current; // Initial position off-screen
  const scaleAnimation = useRef(new Animated.Value(0)).current; // Initial scale value

  useEffect(() => {
    Animated.timing(buttonRowAnimation, {
      toValue: 0, // Final position on-screen
      duration: 500, // Animation duration in milliseconds
      easing: Easing.sin,
      useNativeDriver: true, // Use native driver for better performance
    }).start();

    Animated.spring(scaleAnimation, {
      toValue: 1, // Final scale value
      friction: 5, // Adjust the spring effect
      useNativeDriver: true, // Use native driver for better performance
    }).start();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const users = await dataProxy.getAllUsers();
      setAllUsers(users);
    };
    fetchUsers();
  }, []);

  // Reset state variables to their initial values
  useFocusEffect(
    React.useCallback(() => {
      // Reset state variables to their initial values
      setDate(new Date());
      setDuration('30');
      setDescription('');
      setLocation({
        latitude: 40.7128,
        longitude: -74.0060,
        title: '',
        description: ''
      });
      setShowDatePicker(false);
      setIsLoadingLocation(true);
      setGroupSize('2');
      setInvitedUsers([]);
      setIsInviteUserModalVisible(false);
      setIsLoading(true);
      
      return () => {
      
      };
    }, [])
  );

  const fetchAddressAndUpdateLocation = async (latitude: number, longitude: number) => {
    const address = await fetchAddress(latitude, longitude);
    setLocation((prevLocation) => ({
      ...prevLocation,
      ...address
    }));
  };

  useFocusEffect(
    React.useCallback(() => {
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

          await fetchAddressAndUpdateLocation(location.latitude, location.longitude);
        }
        setIsLoadingLocation(false);
      })();
    }, [])
  );

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

    setIsSelectOnMapModalVisible(true); // Show the modal
  };

  const inviteUser = () => {
    setIsInviteUserModalVisible(true);
    setSearchQuery('');
  };

  const selectUser = (user: UserDetails) => {
    if (!invitedUsers.some(invitedUser => invitedUser.id === user.id)) {
      setInvitedUsers([...invitedUsers, user]);
    }
    setSearchQuery('');
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
        <ThemedText style={styles.label}>Location (tap map to set)</ThemedText>
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
              height={150}
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.010,
                longitudeDelta: 0.010,
              }}
              onPress={handleMapPress}
            />
          )
        )}
        <Text style={styles.locationText}>Location: {location.title}</Text>

        {/* Invited Users List */}
        {invitedUsers.length > 0 && (
          <>
            <ThemedText style={styles.label}>Invited Friends</ThemedText>
            <View style={styles.invitedUsersContainer}>
              {invitedUsers.map(user => (
                <TouchableOpacity
                  key={user.id}
                  onPress={() => setInvitedUsers(invitedUsers.filter(invitedUser => invitedUser.id !== user.id))}
                >
                  <Animated.Image
                    source={{ uri: user.profileImage }}
                    style={[
                      styles.profileImage,
                      { transform: [{ scale: scaleAnimation }] } // Apply scale animation
                    ]}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

      </ScrollView>

   

      {/* Invite User and Submit Buttons at the bottom */}
      <Animated.View style={{ transform: [{ translateY: buttonRowAnimation }] }}>
      <View style={styles.buttonRow}>
        <Button
          onPress={inviteUser}
          title="Invite Friends"
          style={styles.inviteButton}
        />
        <Button
          onPress={async () => {
            await fetchAddressAndUpdateLocation(location.latitude, location.longitude);
            createWalk();
          }}
          title="Schedule Walk"
          style={styles.submitButton}
        />
      </View>
      </Animated.View>

   {/* Invite User Modal */}
   <InviteUsersModal
     visible={isInviteUserModalVisible}
     searchQuery={searchQuery}
     users={allUsers}
     onSelectUser={selectUser}
     onClose={() => setIsInviteUserModalVisible(false)}
   />

      {!isLoadingLocation && (
        <SelectOnMapModal
          visible={isSelectOnMapModalVisible}
          initialLocation={location}
          onLocationSelect={async (location) => {
            setLocation({
              ...location,
              title: '',
              description: ''
            });
            await fetchAddressAndUpdateLocation(location.latitude, location.longitude);
          }}
          onRequestClose={() => setIsSelectOnMapModalVisible(false)} // Allow closing the modal
        />
      )}

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
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
  },
  locationText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
});
