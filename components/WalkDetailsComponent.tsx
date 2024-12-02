import React, { useRef, useEffect, useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { Text } from '../components/Themed';
import { Map } from '../components/Map';
import { Button } from '../components/Button';
import { IconSymbol } from '../components/ui/IconSymbol';
import { PlannedWalk } from '../types/PlannedWalk';
import { ThemedText } from '../components/ThemedText';
import { dataProxy } from '../data/DataProxy';
import { UserDetails } from '../types/UserDetails';

interface WalkDetailsComponentProps {
  walkDetails: PlannedWalk;
  onProfileImagePress: () => void;
  onCancelPress: () => void;
}

const WalkDetailsComponent: React.FC<WalkDetailsComponentProps> = ({
  walkDetails,
  onProfileImagePress,
  onCancelPress,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial value for opacity: 0
  const [users, setUsers] = useState<UserDetails[]>([]);

  useEffect(() => {
    const fetchUsersFromJoinedUserIds = async () => {
      const users = await dataProxy.getUsersFromJoinedUserIds(walkDetails.id);
      setUsers(users);
    };

    fetchUsersFromJoinedUserIds();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 0, // Duration of the fade-in effect
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Format the date to display month and day
  const formattedDate = new Date(walkDetails.dateTime).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <ScrollView>
        <View style={{ flex: 1 }}>
        <Text style={styles.textBold}>{walkDetails.location}, {formattedDate} at {walkDetails.dateTime.split('T')[1].slice(0, 5)}</Text>
        <View style={styles.profileContainer}>
            <TouchableOpacity onPress={onProfileImagePress}>
              <Image 
                source={{ uri: walkDetails.profileImage }}
                style={styles.profileImageSmall}
              />
            </TouchableOpacity>
            <Text style={styles.hostText}>With {walkDetails.username}</Text>
          </View>
          <Map
            initialRegion={{
              latitude: walkDetails.latitude,
              longitude: walkDetails.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
              zoomLevel: 4,
            }}
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
            height={300}
          />
          
          <View style={styles.walkDetailsContainer}>
          
            <Text style={styles.text}>{walkDetails.description}</Text>
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
          
          <Text style={styles.participantsText}>participants:</Text> 
          <View style={styles.usersListContainer}>
            {users
              .filter(user => user.id !== walkDetails.userId)
              .map((user) => (
                <View key={user.id} style={styles.userItem}>
                  <Image source={{ uri: user.profileImage }} style={styles.userImage} />
                  <Text style={styles.userName}>{user.fullName}</Text>
                </View>
              ))}
          </View>
        </View>
      </ScrollView>
      <Button
        title="Cancel"
        onPress={onCancelPress}
        style={{ marginTop: 16, backgroundColor: '#ff0000' }}
      />
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
  text: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  participantsText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  hostText: {
    fontSize: 20,
    color: '#333',
    marginBottom: 8,
  },
  textBold: {
    fontSize: 16,
    fontWeight: 'bold',
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
});

export default WalkDetailsComponent;
