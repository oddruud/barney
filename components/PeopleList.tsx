import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Modal, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import { UserDetails } from '../types/UserDetails';
import { UserDetailsWithDistance } from '../types/UserDetailsWithDistance';
import { useData } from '@/contexts/DataContext';
import UserInteractionItem from './UserInteractionItem';
import { useFocusEffect } from '@react-navigation/native';
import { DeviceType, getDeviceType } from '@/utils/deviceUtils';


interface PeopleListProps {
  user: UserDetails;
  searchRadius: number;
};

interface UserInteractions {
    user: UserDetailsWithDistance;
    lastMessage: string;
    lastMessageDate: Date;
}

const PeopleList: React.FC<PeopleListProps> = ({ user, searchRadius }) => {
  const { dataProxy } = useData();
  const [userInteractions, setUserInteractions] = useState<UserInteractions[]>([]);


  const getInteractions = async () => {
    const users = await dataProxy.getUsersSortedByDistance(user, searchRadius);
    const interactions: UserInteractions[] = [];

    users.forEach(async (otherUser) => {
      const userInteraction = await dataProxy.getUserInteractionForUsers(user.id, otherUser.id);
      if (userInteraction) {
        const lastMessage = await dataProxy.getLastChatMessageForChatId(userInteraction.chatId);
        interactions.push({ user: otherUser, lastMessage: lastMessage?.message || '', lastMessageDate: lastMessage?.timestamp.toDate() || new Date() });
        setUserInteractions(interactions);
      }
    });
  }

  useEffect(() => {
    getInteractions();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      getInteractions();
    }, [])
  );

  const deviceType = getDeviceType();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'space-between',
      padding: 16,
    },
    userInteractionItem: {
      marginBottom: 16,
      width: deviceType === DeviceType.Tablet ? '50%' : '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <FlatList
        data={userInteractions}
        keyExtractor={(item) => item.user.email.toString()}
        renderItem={({ item }) => (
          <View style={styles.userInteractionItem}>
            <UserInteractionItem userInteraction={item} />
          </View>
        )}
      />
    </View>
  );
};

export default PeopleList;
