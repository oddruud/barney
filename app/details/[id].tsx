import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Image, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { Text } from '../../components/Themed';
import { useRoute, useNavigation } from '@react-navigation/native';
import ChatComponent from '../../components/ChatComponent';
import WalkDetailsComponent from '../../components/WalkDetailsComponent';
import AboutComponent from '../../components/AboutComponent';
import { Button } from '../../components/Button';
import { dataProxy } from '../../data/DataProxy';
import { PlannedWalk } from '../../types/PlannedWalk';
import { UserDetails } from '../../types/UserDetails';
import { useUser } from '@/contexts/UserContext';
import { router } from 'expo-router';

// Define a sleep function
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function WalkDetails() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: string };
  const { user } = useUser();
  const [walkDetails, setWalkDetails] = useState<PlannedWalk | null>(null);
  const [organizerDetails, setOrganizerDetails] = useState<UserDetails | null>(null);

  useEffect(() => {
    const fetchWalkDetails = async () => {
      const walk = await dataProxy.getPlannedWalk(id);    
      setWalkDetails(walk || null);

      if (walk) {
        const user = await dataProxy.getUserDetailsById(walk.userId);
        setOrganizerDetails(user || null);
      }

    };

    fetchWalkDetails();
  }, [id, walkDetails]);

    // State for managing active tab
    const [activeTab, setActiveTab] = useState('details');

  if (!walkDetails) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <Button style ={styles.backButton} title="Back" onPress={() => router.back()} />
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity onPress={() => setActiveTab('details')} style={activeTab === 'details' ? styles.activeTab : styles.tab}>
          <Text style={styles.tabText}>Details</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('chat')} style={activeTab === 'chat' ? styles.activeTab : styles.tab}>
          <Text style={styles.tabText}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('about')} style={activeTab === 'about' ? styles.activeTab : styles.tab}>
          <Text style={styles.tabText}>About Organizer</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'details' && (
        <WalkDetailsComponent
          walkDetails={walkDetails}
          user={user}
          onProfileImagePress={() => setActiveTab('about')}
          onCancelPress={async () => { 
            if (user) {
              if (user.id === walkDetails.userId) {
                await dataProxy.cancelPlannedWalk(walkDetails.id);
                router.back();
              } else {
                const newWalkDetails = await dataProxy.unsubscribeFromWalk(walkDetails.id, user.id);
                setWalkDetails(newWalkDetails);
                await sleep(10);
              }
            }
          }}
          onJoinPress={async () => {
            if (user) {
              const newWalkDetails = await dataProxy.joinWalk(walkDetails.id, user.id);
              await dataProxy.declineInvite(walkDetails.id, user.id);
              setWalkDetails(newWalkDetails);
              await sleep(10);
            }
          }}
          onDeclineInvite={async () => {
            if (user) {
              await dataProxy.declineInvite(walkDetails.id, user.id);
              await sleep(100);
              router.back();
            }
          }}
        />
      )}

      {activeTab === 'chat' && (
        <ChatComponent walkId={id} user={user}/>
      )}

      {activeTab === 'about' && organizerDetails && (
        <AboutComponent user={organizerDetails} />
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
  backButton: {
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
    textDecorationLine: 'none',
    marginBottom: 20,
    width: 100,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 16,
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
  }
});
