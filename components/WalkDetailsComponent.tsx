import React, { useRef, useEffect, useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Animated, ScrollView, Linking, Platform, Modal, Share } from 'react-native';
import { Text } from '../components/Themed';
import { Map } from '../components/Map';
import { Button } from '../components/Button';
import { IconSymbol } from '../components/ui/IconSymbol';
import { ThemedText } from '../components/ThemedText';
import { PlannedWalk } from '../types/PlannedWalk';
import { UserDetails } from '../types/UserDetails';
import { useData } from '@/contexts/DataContext';
import ProfileImage from './ProfileImage';
import AreYouSureModal from './modals/AreYouSureModal';
import { addToCalendar } from '../utils/calendarUtils';
import FullscreenMapModal from './modals/FullscreenMapModal';


interface WalkDetailsComponentProps {
  walkDetails: PlannedWalk;
  user: UserDetails | null;
  onProfileImagePress: () => void;
  onCancelPress: () => void;
  onJoinPress: () => void;
  onDeclineInvite: () => void;
}

const WalkDetailsComponent: React.FC<WalkDetailsComponentProps> = ({
  walkDetails,
  user,
  onProfileImagePress,
  onCancelPress,
  onJoinPress,
  onDeclineInvite,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial value for opacity: 0
  const [users, setUsers] = useState<UserDetails[]>([]);
  const [isLocalUserJoined, setIsLocalUserJoined] = useState(false);
  const [updateState, setUpdateState] = useState(0);
  const [isInvited, setIsInvited] = useState(false);
  const scaleFadeAnim = useRef(new Animated.Value(0)).current; // Initial value for scale and opacity: 0
  const [isAreYouSureModalVisible, setIsAreYouSureModalVisible] = useState(false);
  const buttonAnim = useRef(new Animated.Value(100)).current; // Initial value for vertical position: 100
  const zoomAnim = useRef(new Animated.Value(6)).current; // Initial zoom level
  const { dataProxy } = useData();
  const [isCalendarButtonPressed, setIsCalendarButtonPressed] = useState(false);
  const isOrganizer = user?.id === walkDetails.userId;
  const [isAddedToCalendarModalVisible, setIsAddedToCalendarModalVisible] = useState(false);
  const [fullscreenMapModalVisible, setFullscreenMapModalVisible] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const [location, setLocation] = useState({
    latitude: walkDetails.latitude,
    longitude: walkDetails.longitude,
    title: walkDetails.location,
    description: walkDetails.description
  });

  useEffect(() => {
    setIsFull(walkDetails.joinedUserIds.length >= walkDetails.maxParticipants);
  }, [walkDetails.joinedUserIds, walkDetails.maxParticipants]);

  useEffect(() => {
    const fetchUsersFromJoinedUserIds = async () => {
      const users = await dataProxy.getUsersFromJoinedUserIds(walkDetails.id);
      setUsers(users);
    };
    fetchUsersFromJoinedUserIds();

    setIsLocalUserJoined(walkDetails.joinedUserIds.includes(user?.id ?? 0));
    setIsInvited(walkDetails.invitedUserIds.includes(user?.id ?? 0));

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 0, // Duration of the fade-in effect
      useNativeDriver: true,
    }).start();
  }, [walkDetails, user, fadeAnim, isLocalUserJoined, updateState, isInvited]);

  useEffect(() => {
    Animated.spring(scaleFadeAnim, {
      toValue: 1,
      friction: 5, // Adjust the friction to control the spring effect
      tension: 40, // Adjust the tension to control the spring effect
      useNativeDriver: true,
    }).start();
  }, [scaleFadeAnim, updateState]);

  useEffect(() => {
    Animated.timing(buttonAnim, {
      toValue: 0,
      duration: 500, // Duration of the slide-up effect
      useNativeDriver: true,
    }).start();
  }, [buttonAnim]);

  useEffect(() => {
    // Animate zoom level
    Animated.timing(zoomAnim, {
      toValue: 12, // Target zoom level
      duration: 1000, // Duration of the zoom animation
      useNativeDriver: false, // Native driver doesn't support non-transform properties
    }).start();
  }, [zoomAnim]);

  // Format the date to display month and day
  const formattedDate = new Date(walkDetails.dateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const openInMaps = () => {
    const { latitude, longitude, location } = walkDetails;
    const encodedLocation = encodeURIComponent(location);
    const url = Platform.select({
      ios: `http://maps.apple.com/?ll=${latitude},${longitude}&q=${encodedLocation}&z=20`,
      android: `geo:${latitude},${longitude}?q=${encodedLocation}`,
    });

    if (url) {
      Linking.openURL(url).catch(err => console.error('An error occurred', err));
    }
  };

  const handleCancelPress = async () => {
    setIsLocalUserJoined(false);
    await onCancelPress();
    setUpdateState(updateState + 1);
    setIsAreYouSureModalVisible(false);
  };

  const handleAddToCalendar = async () => {
    const calendarTitle = "Walk Events";
    const calendarColor = "blue";
    const eventTitle = "walk with " + walkDetails.fullName + " at " + walkDetails.location;
    const eventStart = new Date(walkDetails.dateTime);
    const eventEnd = new Date(new Date(walkDetails.dateTime).getTime() + walkDetails.duration * 60 * 1000);
    const eventLocation = walkDetails.location;
    const eventNotes = walkDetails.description;

    addToCalendar(calendarTitle, calendarColor, eventTitle, eventStart, eventEnd, eventLocation, eventNotes);
    
    setIsAddedToCalendarModalVisible(true);
    setTimeout(() => {
      setIsAddedToCalendarModalVisible(false);
    }, 1000);
    setIsCalendarButtonPressed(true);
  };

  const handleSharePress = async () => {
    try {
      const result = await Share.share({
        message: `Join me for a walk at ${walkDetails.location} on ${formattedDate} at ${new Date(walkDetails.dateTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}.`,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      console.error('An error occurred while sharing', error);
    }
  };

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <ScrollView>
        <View style={{ flex: 1 }}>
          <Map
            onPress={() => setFullscreenMapModalVisible(true)}
            initialRegion={{
              latitude: walkDetails.latitude,
              longitude: walkDetails.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
              zoomLevel: 3, // Use animated zoom level
            }}
            showUserLocation={false}
            markers={[
              {
                id: '1',
                coordinate: {
                  latitude: walkDetails.latitude,
                  longitude: walkDetails.longitude,
                },
                title: walkDetails.location,
                description: walkDetails.description,
              },
            ]}
            width="100%"
            height={240}
          />
          
          <View style={styles.walkDetailsContainer}>
            <Text style={styles.descriptionText}>{walkDetails.description}</Text>
            <View style={styles.durationContainer}>
              <IconSymbol name="timer" size={16} color="#333" style={styles.icon} />
              <ThemedText>{walkDetails.duration * 60} minutes</ThemedText>
            </View>
            <View style={styles.participantsContainer}>
              <IconSymbol name="person" size={16} color="#333" style={styles.icon} />
              <ThemedText>
                {walkDetails.joinedUserIds.length} / {walkDetails.maxParticipants}
              </ThemedText>
            </View>
          </View> 
          <Animated.View
            style={[
              styles.profileContainer,
              {
                opacity: scaleFadeAnim,
                transform: [{ scale: scaleFadeAnim }],
              },
            ]}
          >
            <TouchableOpacity onPress={onProfileImagePress}>
              {walkDetails.organizer && <ProfileImage user={walkDetails.organizer} style={styles.profileImageSmall} />}
            </TouchableOpacity>
            <Text style={styles.hostText}>
              {isOrganizer ? "Organized by you" : `With ${walkDetails.fullName}`}
            </Text>
          
          </Animated.View>
          <View style={styles.usersListContainer}>
            {users
              .filter(user => user.id !== walkDetails.userId)
              .map((user) => (
                <Animated.View
                  key={user.id}
                  style={[
                    styles.userItem,
                    {
                      opacity: scaleFadeAnim,
                      transform: [{ scale: scaleFadeAnim }],
                    },
                  ]}
                >
                  <ProfileImage user={user} style={styles.userImage} />
                  <Text style={styles.userName}>{user.fullName}</Text>
                </Animated.View>
              ))}
          </View>
        </View>
      </ScrollView>
      
      {!walkDetails.cancelled ? (
        <Animated.View style={{ transform: [{ translateY: buttonAnim }] }}>
           <View style={styles.buttonRow}>
          <Button
            title="Open in Maps"
            onPress={openInMaps}
            style={isCalendarButtonPressed ? styles.fullWidthButton : styles.buttonStyle}
          />
          {!isCalendarButtonPressed && (
            <Button
              title="Add to Calendar"
              onPress={handleAddToCalendar}
              style={styles.buttonStyle}
            />
          )}
          </View>
          {!isLocalUserJoined && !isFull && (
            <View style={styles.buttonRow}>
              <Button
                title="Join"
                onPress={async () => {
                  setIsLocalUserJoined(true);
                  setUpdateState(updateState + 1); //ugly hack
                  await onJoinPress();
                  setUpdateState(updateState + 1);
                }}
                style={isInvited ? styles.joinButton : styles.fullWidthButton}
              />
              {isInvited && (
                <Button
                  title="Decline"
                  onPress={async () => {
                    await onDeclineInvite();
                  }}
                  style={styles.declineButton}
                />
              )}
            </View>
          )}

          {isLocalUserJoined && (
            <Button
              title={isOrganizer ? "Cancel Walk" : "Leave Walk"}
              onPress={() => {
                if (isOrganizer) {
                  setIsAreYouSureModalVisible(true);
                } else {
                  handleCancelPress();
                }
              }}
              style={styles.cancelButton}
            />
          )}
        </Animated.View>
      ) : (
        <View style={styles.cancelledMessageContainer}>
          <Text style={styles.cancelledMessageText}>This walk has been cancelled.</Text>
        </View>
      )}

      <AreYouSureModal
        title="Are you sure you want to cancel this walk?"
        visible={isAreYouSureModalVisible}
        onConfirm={handleCancelPress}
        onCancel={() => setIsAreYouSureModalVisible(false)}
      />

      <FullscreenMapModal
        title="Walk Location"
        visible={fullscreenMapModalVisible}
        initialLocation={location}
        allowLocationSelection={false}
        onLocationSelect={async (location: { latitude: number; longitude: number }) => {
          
        }}
          onRequestClose={() => setFullscreenMapModalVisible(false)} // Allow closing the modal
        />

      <Modal
        transparent={true}
        visible={isAddedToCalendarModalVisible}
        animationType="fade"
        onRequestClose={() => setIsAddedToCalendarModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Added to Calendar</Text>
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    marginTop: 4,
  },
  profileImageSmall: {
    width: 40,
    height: 40,
    borderRadius: 30,
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#00796b',
  },
  textBold: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    marginTop: 0,
    fontStyle: 'italic',
    padding: 8,
  },
  hostText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  walkDetailsContainer: {
    marginTop: 8,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  icon: {
    marginRight: 4,
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  usersListContainer: {
    marginTop: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  userName: {
    fontSize: 16,
    color: '#333',
  },
  organizerText: {
    fontSize: 14,
    color: '#007aff',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    marginHorizontal: 10,
    width: '45%',
  },
  modalButtonYes: {
    marginHorizontal: 10,
    backgroundColor: '#ff0000',
    width: '45%',
  },
  cancelButton: {
    marginTop: 16,
    backgroundColor: '#ff0000',
  },
  buttonStyle: {
    marginTop: 16,
    backgroundColor: '#007aff',
    width: '45%',
  },
  joinButton: {
    width: '45%',
    backgroundColor: '#007aff',
  },
  declineButton: {
    backgroundColor: '#ff0000',
    width: '45%',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  fullWidthButton: {
    width: '100%',
    backgroundColor: '#007aff',
  },
  cancelledMessageContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  cancelledMessageText: {
    fontSize: 18,
    color: '#ff0000',
  },
  shareButton: {
    marginLeft: 56,
  },
  shareImage: {
    width: 24,
    height: 24,
  },
});

export default WalkDetailsComponent;
