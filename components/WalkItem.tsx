import React, { useRef, useEffect, useState } from 'react';
import { View, Animated } from 'react-native';
import { Text } from '../components/Themed';
import { Link } from 'expo-router';
import { PlannedWalk } from '../types/PlannedWalk';
import { StyleSheet } from 'react-native';
import { IconSymbol } from '../components/ui/IconSymbol';
import { Map } from '../components/Map';
import ProfileImage from './ProfileImage';
import { useData } from '@/contexts/DataContext';
import { RewardInfo } from '@/types/RewardInfo';
import CachedImage from './CachedImage';

function WalkItem({ item, showDate, animated }: { item: PlannedWalk, showDate: boolean, animated: boolean }) {
  const { dataProxy } = useData();
  const fadeAnim = useRef(new Animated.Value(animated ? 0 : 1)).current;
  const scaleAnim = useRef(new Animated.Value(animated ? 0.8 : 1)).current;
  const isPastWalk = new Date(item.dateTime) < new Date();

  useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
      ]).start();
  }
}, [fadeAnim, scaleAnim]);


  return (
    <Animated.View 
      style={{ 
        ...styles.walkItem, 
        backgroundColor: isPastWalk ? 'rgba(211, 211, 211, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        opacity: 1,
        borderColor: item.joinedUserIds.includes(item.userId) ? '#00796b' : '#004d40',
        transform: [{ scale: scaleAnim }] 
      }}
    >
      <Link href={{ pathname: '/details/[id]', params: { id: item.id } }}>
        <View style={styles.walkHeader}>
          {item.organizer && (
            <ProfileImage user={item.organizer} style={styles.profileImage} />
          )}
          <View style={styles.walkInfo}>
            <Text style={styles.date}>
              {showDate ? `${new Date(item.dateTime).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} at ${new Date(item.dateTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}` : new Date(item.dateTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <Text style={styles.location}>{item.location}</Text>
            <Text style={styles.username}>with {item.fullName}</Text>
            <Text style={styles.participants}>{item.joinedUserIds.length} / {item.maxParticipants}</Text> 
            {new Date(item.lastMessageDate) > new Date(item.lastDateMessagesChecked) && (
              <View style={styles.newMessageContainer}>
                <IconSymbol name="paperplane.fill" size={16} color="red" style={styles.messageIcon} />
                <Text style={styles.newMessageIndicator}>New Messages</Text>
              </View>
            )}
          </View>
          {item.reward && (
            <CachedImage url={item.reward.image} style={styles.rewardImage} />
          )}
          {!item.reward && (
            <Map
              initialRegion={{
                latitude: item.latitude,
                longitude: item.longitude,
                latitudeDelta: 0.009,
                longitudeDelta: 0.009,
              }}
              markers={[]}
              width={80}
              height={80}
            />
          )}
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
      borderRadius: 37.5,
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
    participants: {
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
    rewardImage: {
      width: 80,
      height: 80,
      borderRadius: 8,
    },
    profileImagePlaceholder: {
      width: 75,
      height: 75,
      borderRadius: 37.5,
      marginRight: 12,
      backgroundColor: '#e0e0e0',
    },
  });
  