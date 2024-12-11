import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import ProfileImage from './ProfileImage';
import { UserDetailsWithDistance } from '../types/UserDetailsWithDistance';

interface UserInteractionItemProps {
  userInteraction: {
    user: UserDetailsWithDistance;
    lastMessage: string;
    lastMessageDate: Date;
  };
}

const UserInteractionItem: React.FC<UserInteractionItemProps> = ({ userInteraction }) => {
  const { user, lastMessage, lastMessageDate } = userInteraction;

  return (
    <Link style={styles.link} href={{ pathname: '/user-interaction/[id]', params: { id: user.id } }}>
      <View style={[styles.row, styles.userItem]}>
        <ProfileImage uri={user.profileImage} style={styles.profileImage} />
        <View>
          <Text style={styles.name}>{user.fullName || 'Anonymous'}</Text>
          {lastMessage && (
            <>
              <Text style={styles.lastMessage}>
                {lastMessage.length > 50 ? `${lastMessage.substring(0, 40)}...` : lastMessage}
              </Text>
              <Text style={styles.lastMessageDate}>
                at {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(lastMessageDate)}
              </Text>
            </>
          )}
        </View>
        <Text style={styles.distance}>{user.distance.toFixed(1)}km</Text>
      </View>
    </Link>
  );
};

const styles = StyleSheet.create({
    profileImage: {
      width: 50,
      height: 50,
      borderRadius: 25,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    name: {
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 16,
    },
    distance: {
      fontSize: 12,
      marginLeft: 16,
      color: 'gray',
      fontWeight: 'bold',
      flex: 1,
      textAlign: 'right',
    },
    userItem: {
      padding: 16,
      marginBottom: 16,
      borderRadius: 10,
      backgroundColor: 'rgba(0,0,0,0.1)',
  
    },
    link: {
      flex: 1,
      marginBottom: 16,
    },
    lastMessage: {
      fontSize: 12,
      marginLeft: 16,
      color: 'gray',
      fontWeight: 'bold',
      marginTop: 6,
    },
    lastMessageDate: {
      marginTop: 6,
      fontSize: 10,
      marginLeft: 16,
      color: 'gray',
      fontWeight: 'bold',
    },
    lastMessageContainer: {
      padding: 16,
    }
  });
  

export default UserInteractionItem;
