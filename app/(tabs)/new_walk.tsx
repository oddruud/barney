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
import FullscreenMapModal from '@/components/modals/FullscreenMapModal';
import InviteUsersModal from '@/components/modals/InviteUsersModal';
import { fetchAddress } from '@/utils/geoUtils';
import { PlannedWalk } from '@/types/PlannedWalk';
import ProfileImage from '@/components/ProfileImage';
import { useSmartService } from '@/contexts/SmartServiceContext';
import { RouteInfo } from '@/types/RouteInfo';


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
  const { smartService } = useSmartService();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [groupSize, setGroupSize] = useState(2); // Default group size
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
      //naive implementation, todo: use only friends of the user
      const users = await dataProxy.getAllUsers();
      setAllUsers(users);
    };
    fetchUsers();
  }, []);

  // Reset state variables to their initial values
  useFocusEffect(
    React.useCallback(() => {
      // Reset state variables to their initial values
      const now = new Date();
      now.setMinutes(now.getMinutes() + 30);
      setDate(now);
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
      setGroupSize(2);
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


  useEffect(() => {
    (async () => {
      await fetchAddressAndUpdateLocation(location.latitude, location.longitude);
    })();
  }, [isLoadingLocation]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  async function createWalk() {
    const invitedUserIds = invitedUsers.map(user => user.id); // Extract user IDs

    const walk: PlannedWalk = {
      id: '', // Provide a default or generated ID
      username: user?.userName ?? '',
      fullName: user?.fullName ?? '',
      profileImage: user?.profileImage ?? '',
      userId: user?.id ?? '',
      dateTime: date.toISOString(),
      duration: parseInt(duration) / 60,
      maxParticipants: groupSize,
      description: description,
      location: location.title,
      longitude: location.longitude,
      latitude: location.latitude,
      lastMessageDate: '',
      lastDateMessagesChecked: '',
      joinedUserIds: [user?.id ?? ''],
      invitedUserIds: invitedUserIds,
      cancelled: false,
    };

    await dataProxy.createPlannedWalk(walk).then((id) => {
      router.push(`/details/${id}`);
    });

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
        <ThemedText style={styles.label}>When</ThemedText>
        <Button 
          onPress={() => setShowDatePicker(true)}
          title={`${date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
        />
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="datetime"
            onChange={handleDateChange}
          />
        )}

        {/* Duration Input */}
        <ThemedText style={styles.label}>How long (minutes)</ThemedText>
        <ThemedTextInput
          style={styles.input}
          value={duration}
          onChangeText={setDuration}
          keyboardType="numeric"
          placeholder="Enter duration in minutes"
        />

        {/* Walk Description */}
        <ThemedText style={styles.label}>Intention</ThemedText>
        <ThemedTextInput
          style={[styles.input, styles.descriptionInput]}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter an intention for the walk"
          multiline
        />

        {/* Group Size Input */}
        <ThemedText style={styles.label}>Group Size</ThemedText>
        <ThemedTextInput
          style={[styles.input, styles.descriptionInput]}
          value={groupSize.toString()}
          onChangeText={(text) => setGroupSize(parseInt(text))}
          placeholder="Enter group size"
        />
     
        <Text>Selected Group Size: {groupSize}</Text>
       

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
                <ProfileImage user={user} style={styles.profileImage} />
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
        <FullscreenMapModal
          title="Place a pin for the start of the walk"
          visible={isSelectOnMapModalVisible}
          initialLocation={location}
          allowLocationSelection={true}
          onLocationSelect={async (location: { latitude: number; longitude: number }) => {
            setLocation({
              ...location,
              title: '',
              description: ''
            });
            await fetchAddressAndUpdateLocation(location.latitude, location.longitude);
          }}
          allowRouteCreation={true}
          onRouteCreated={async (routeInfo: RouteInfo) => {
            console.log("route has been created");
            console.log(routeInfo.description);
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
