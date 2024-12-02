import React, { useRef, useEffect } from 'react';
import { View, Image, Animated } from 'react-native';
import { Text } from '../components/Themed';
import { useNavigation } from '@react-navigation/native';
import { Link } from 'expo-router';
import { PlannedWalk } from '../types/PlannedWalk';
import { StyleSheet } from 'react-native';
import { IconSymbol } from '../components/ui/IconSymbol';
import { Map } from '../components/Map';


function WalkItem({ item, showDate }: { item: PlannedWalk, showDate: boolean }) {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={{ ...styles.walkItem, opacity: fadeAnim }}>
      <Link href={{ pathname: '/details/[id]', params: { id: item.id } }}>
        <View style={styles.walkHeader}>
          <Image
            source={{ uri: item.profileImage }}
            style={styles.profileImage}
          />
          <View style={styles.walkInfo}>
            <Text style={styles.date}>
              {showDate ? `${new Date(item.dateTime).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })} at ${item.dateTime.split('T')[1].slice(0, 5)}` : item.dateTime.split('T')[1].slice(0, 5)}
            </Text>
            <Text style={styles.location}>{item.location}</Text>
            <Text style={styles.duration}>{item.duration * 60} minutes</Text>
            <Text style={styles.username}>with {item.username}</Text>
            {new Date(item.lastMessageDate) > new Date(item.lastDateMessagesChecked) && (
              <View style={styles.newMessageContainer}>
                <IconSymbol name="paperplane.fill" size={16} color="red" style={styles.messageIcon} />
                <Text style={styles.newMessageIndicator}>New Messages</Text>
              </View>
            )}
          </View>
          <Map
            initialRegion={{
              latitude: item.latitude,
              longitude: item.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            markers={[{ id: item.id, coordinate: { latitude: item.latitude, longitude: item.longitude } }]}
            width={80}
            height={80}
          />
        </View>
      </Link>
    </Animated.View>
  );
}

export default WalkItem;

const styles = StyleSheet.create({
    walkItem: {
      backgroundColor: '#ffffff',
      padding: 16,
      marginBottom: 12,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    walkHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    profileImage: {
      width: 75,
      height: 75,
      borderRadius: 25,
      marginRight: 12,
      borderColor: '#00796b',
      borderWidth: 2,
    },
    walkInfo: {
      flex: 1,
    },
    date: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#00796b',
      marginBottom: 4,
    },
    location: {
      fontSize: 14,
      marginBottom: 4,
      color: '#004d40',
    },
    duration: {
      fontSize: 14,
      color: '#666',
    },
    username: {
      fontSize: 14,
      color: '#004d40',
    },
    newMessageIndicator: {
      fontSize: 12,
      color: 'red',
      fontWeight: 'bold',
      marginTop: 4,
    },
    newMessageContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },
    messageIcon: {
      marginRight: 4,
    },
  });
  
