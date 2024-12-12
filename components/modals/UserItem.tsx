import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Animated, Image, Text, StyleSheet } from 'react-native';
import { UserDetails } from '@/types/UserDetails';
import ProfileImage from '../ProfileImage';
interface UserItemProps {
  user: UserDetails;
  onSelectUser: (user: UserDetails) => void;
}

const UserItem: React.FC<UserItemProps> = ({ user, onSelectUser }) => {
  return (
    <TouchableOpacity onPress={() => onSelectUser(user)}>
      <Animated.View style={styles.userItemContainer}>
        <ProfileImage user={user} style={styles.userProfileImage} />
        <Text style={styles.userItem}>{user.fullName}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  userItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginVertical: 5,
    width: '50%',
  },
  userProfileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 10,
  },
  userItem: {
    padding: 10,
    marginVertical: 5,
    width: '100%',
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#ffffff',
    fontSize: 18,
  },
});

export default UserItem;
