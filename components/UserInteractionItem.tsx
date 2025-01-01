import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import ProfileImage from './ProfileImage';
import { UserDetailsWithDistance } from '../types/UserDetailsWithDistance';
import { formatTimeSince, formatDistance } from '@/utils/stringUtils';

interface UserInteractionItemProps {
  userInteraction: {
    user: UserDetailsWithDistance;
    lastMessage: string;
    lastMessageDate: Date;
  };
}

const UserInteractionItem: React.FC<UserInteractionItemProps> = ({ userInteraction }) => {
  const { user, lastMessage, lastMessageDate } = userInteraction;


  const formatLastMessageDate = (date: Date) => {
    const today = new Date();
    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return `Today ${new Intl.DateTimeFormat('en-US', { timeStyle: 'short' }).format(date)}`;
    }
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  }

  return (
    <Link style={styles.link} href={{ pathname: '/user-interaction/[id]', params: { id: user.id } }}>
      <View style={[styles.row, styles.userItem]}>
        <ProfileImage user={user} style={styles.profileImage} />
        <View>
          <Text style={styles.name}>{user.fullName || 'Anonymous'}</Text>
          {lastMessage && (
            <>
              <Text style={styles.lastMessage}>
                {lastMessage.length > 25 ? `${lastMessage.substring(0, 25)}...` : lastMessage}
              </Text>
              <Text style={styles.lastMessageDate}>
                {formatLastMessageDate(lastMessageDate)}
              </Text>
            </>
          )}
        </View>
        <View style={styles.infoContainer}>
            <Text style={styles.distance}>{formatDistance(user.distance)}</Text>
            {user.lastCheckIn && (
            <Text style={styles.lastCheckIn}>{formatTimeSince(new Date(user.lastCheckIn))}</Text>
            )}
        </View>
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
    infoContainer: {
        flex: 1,
        textAlign: 'right',
        alignItems: 'flex-end',
    },
    distance: {
      fontSize: 12,
      marginLeft: 16,
      color: 'gray',
      fontWeight: 'bold'
    },
    lastCheckIn: {
      fontSize: 12,
      marginLeft: 16,
      color: 'gray',
      fontWeight: 'bold',
    },
    userItem: {
      padding: 16,
      marginBottom: 16,
      borderRadius: 10,
      backgroundColor: 'white',
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
  
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
