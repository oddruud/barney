import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Modal, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import { UserDetails } from '../types/UserDetails';
import { UserDetailsWithDistance } from '../types/UserDetailsWithDistance';
import { useData } from '@/contexts/DataContext';
import UserInteractionItem from './UserInteractionItem';
import { useFocusEffect } from '@react-navigation/native';


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

  return (
    <View style={styles.container}>
      <FlatList
        data={userInteractions}
        keyExtractor={(item) => item.user.email.toString()}
        renderItem={({ item }) => (
          <UserInteractionItem userInteraction={item} />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16,
  },
});

export default PeopleList;
