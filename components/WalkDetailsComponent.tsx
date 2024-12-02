import React, { useRef, useEffect, useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Animated, ScrollView, Linking, Platform, Modal } from 'react-native';
import { Text } from '../components/Themed';
import { Map } from '../components/Map';
import { Button } from '../components/Button';
import { IconSymbol } from '../components/ui/IconSymbol';
import { ThemedText } from '../components/ThemedText';
import { PlannedWalk } from '../types/PlannedWalk';
import { UserDetails } from '../types/UserDetails';
import { dataProxy } from '../data/DataProxy';

interface WalkDetailsComponentProps {
  walkDetails: PlannedWalk;
  user: UserDetails | null;
  onProfileImagePress: () => void;
  onCancelPress: () => void;
  onJoinPress: () => void;
}

const WalkDetailsComponent: React.FC<WalkDetailsComponentProps> = ({
  walkDetails,
  user,
  onProfileImagePress,
  onCancelPress,
  onJoinPress,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial value for opacity: 0
  const [users, setUsers] = useState<UserDetails[]>([]);
  const [isLocalUserJoined, setIsLocalUserJoined] = useState(false);
  const [updateState, setUpdateState] = useState(0);
  const scaleFadeAnim = useRef(new Animated.Value(0)).current; // Initial value for scale and opacity: 0
  const [isAreYouSureModalVisible, setIsAreYouSureModalVisible] = useState(false);

  const isOrganizer = user?.id === walkDetails.userId;

  useEffect(() => {
    const fetchUsersFromJoinedUserIds = async () => {
      const users = await dataProxy.getUsersFromJoinedUserIds(walkDetails.id);
      setUsers(users);
    };
    fetchUsersFromJoinedUserIds();
    setIsLocalUserJoined(walkDetails.joinedUserIds.includes(user?.id ?? 0));

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 0, // Duration of the fade-in effect
      useNativeDriver: true,
    }).start();
  }, [walkDetails, user, fadeAnim, isLocalUserJoined, updateState]);

  useEffect(() => {
    Animated.timing(scaleFadeAnim, {
      toValue: 1,
      duration: 500, // Duration of the scale and fade effect
      useNativeDriver: true,
    }).start();
  }, [scaleFadeAnim, updateState]);

  // Format the date to display month and day
  const formattedDate = new Date(walkDetails.dateTime).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

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

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <ScrollView>
        <View style={{ flex: 1 }}>
          <Text style={styles.textBold}>
            {walkDetails.location}, {formattedDate} at {walkDetails.dateTime.split('T')[1].slice(0, 5)}
          </Text>
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
              <Image 
                source={{ uri: walkDetails.profileImage }}
                style={styles.profileImageSmall}
              />
            </TouchableOpacity>
            <Text style={styles.hostText}>With {walkDetails.username}</Text>
            {isOrganizer && <Text style={styles.organizerText}>(You)</Text>}
          </Animated.View>
          <Map
            initialRegion={{
              latitude: walkDetails.latitude,
              longitude: walkDetails.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
              zoomLevel:6,
            }}
            showUserLocation={true}
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
                  <Image source={{ uri: user.profileImage }} style={styles.userImage} />
                  <Text style={styles.userName}>{user.fullName}</Text>
                </Animated.View>
              ))}
          </View>
        </View>
      </ScrollView>
      
      <Button
        title="Open in Maps"
        onPress={openInMaps}
        style={styles.buttonStyle}
      />

      {!isLocalUserJoined && (
        <Button
          title="Join"
          onPress={async () => {
            setIsLocalUserJoined(true);
            await onJoinPress();
            setUpdateState(updateState + 1);
          }}
          style={styles.buttonStyle}
        />
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

      <Modal
        transparent={true}
        visible={isAreYouSureModalVisible}
        animationType="fade"
        onRequestClose={() => setIsAreYouSureModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Are you sure you want to cancel the walk?</Text>
            <View style={styles.modalButtons}>
              <Button title="Yes" onPress={handleCancelPress} style={styles.modalButtonYes} />
              <Button title="No" onPress={() => setIsModalVisible(false)} style={styles.modalButton} />
            </View>
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
    marginBottom: 16,
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
    fontSize: 18,
    color: '#333',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  hostText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  walkDetailsContainer: {
    marginTop: 32,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    marginHorizontal: 10,
  },
  modalButtonYes: {
    marginHorizontal: 10,
    backgroundColor: '#ff0000',
  },
  cancelButton: {
    marginTop: 16,
    backgroundColor: '#ff0000',
  },
  buttonStyle: {
    marginTop: 16,
    backgroundColor: '#007aff',
  },
});

export default WalkDetailsComponent;
