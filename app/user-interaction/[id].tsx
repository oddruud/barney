import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Image, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { Text } from '../../components/Themed';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useUser } from '@/contexts/UserContext';
import { useData } from '@/contexts/DataContext';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { router } from 'expo-router';
import { UserInteraction } from '@/types/UserInteraction';
import ChatComponent from '@/components/ChatComponent';
import { UserDetails } from '@/types/UserDetails';
import AboutComponent from '@/components/AboutComponent';

export default function UserInteractionScreen() {
  const route = useRoute();
  const { id } = route.params as { id: string };
  const { user } = useUser();
  const { dataProxy } = useData();
  const [userInteraction, setUserInteraction] = useState<UserInteraction | null>(null);
  const [otherUser, setOtherUser] = useState<UserDetails | null>(null);
  const [activeTab, setActiveTab] = useState('chat');

  useEffect(() => {
    
    const getUserInteraction = async () => {  
      if (user) {
        const interaction = await dataProxy.getUserInteractionForUsers(user.id, id);
        setUserInteraction(interaction);

        if (interaction) {
          // Get the ID of the user that isn't the current user
          const otherUserId = interaction.user1Id === user.id ? interaction.user2Id : interaction.user1Id;
          const otherUser = await dataProxy.getUserDetailsById(otherUserId);
          setOtherUser(otherUser);
        }
      }
    }
    getUserInteraction();
  }, [user, id]);

useEffect(() => {
  if (userInteraction) {
    console.log(userInteraction);
  }
}, [userInteraction]);

  return (
    <View style={styles.container}>
    <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 30 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <IconSymbol 
          name="chevron.left" 
          size={24} 
          color="#00796b" 
          style={{ opacity: 1 }}
        />
        <Text style={{ color: '#00796b', fontSize: 16 }}>Back</Text>
      </View>
    </TouchableOpacity>
      <View style={styles.tabContainer}>
        <TouchableOpacity onPress={() => setActiveTab('chat')} style={activeTab === 'chat' ? styles.activeTab : styles.tab}>
          <Text style={styles.tabText}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('about')} style={activeTab === 'about' ? styles.activeTab : styles.tab}>
          <Text style={styles.tabText}>About</Text>
        </TouchableOpacity>
      </View>
    {activeTab === 'chat' && (
      <ChatComponent chatId={userInteraction?.chatId ?? ''} user={user} />
    )}

    {activeTab === 'about' && otherUser && (
      <AboutComponent user={otherUser} showRateButton={false} />
    )}
    
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    marginTop: 32,
    backgroundColor: '#f5f5f5',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 16,
    padding: 16,
  },
  tab: {
    padding: 10,
    backgroundColor: '#0E1111',
    borderRadius: 10,
    marginRight: 10,
  },
  activeTab: {
    padding: 10,
    backgroundColor: '#00796b',
    borderRadius: 10,
    marginRight: 10,
  },
  tabText: {
    color: '#fff',
    fontWeight: 'bold',
  },

});
