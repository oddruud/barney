import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Image, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { Text } from '../../components/Themed';
import { useRoute, useNavigation } from '@react-navigation/native';
import ChatComponent from '../../components/ChatComponent';
import WalkDetailsComponent from '../../components/WalkDetailsComponent';
import AboutComponent from '../../components/AboutComponent';
import { PlannedWalk } from '../../types/PlannedWalk';
import { useUser } from '@/contexts/UserContext';
import { router } from 'expo-router';
import { useData } from '@/contexts/DataContext';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { getPrevRouteName } from '@/utils/routeUtils';
import { RewardInfo } from '@/types/RewardInfo';
import RewardComponent from '@/components/RewardComponent';
import { useGenAI } from '@/contexts/GenAIContext';

// Define a sleep function
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function WalkDetails() {
  const route = useRoute();
  const [prevRoute, setPrevRoute] = useState<string | null>(null);
  const navigation = useNavigation();
  const { id } = route.params as { id: string };
  const { user } = useUser();
  const { dataProxy } = useData();
  const [walkDetails, setWalkDetails] = useState<PlannedWalk | null>(null);
  const { genAIService } = useGenAI();
  useEffect(() => {
    const fetchWalkDetails = async () => {
      const walk = await dataProxy.getPlannedWalk(id);
      setWalkDetails(walk || null);

      // Polling logic: continue fetching if reward is null or undefined
      if (!walk?.reward) {
        const genAIIsOnline = await genAIService.pingServer();
        if (genAIIsOnline) {
          console.log('Polling for reward...');
          await sleep(3000); // Wait for 3 seconds before retrying
          fetchWalkDetails();
        } else {
          console.log('GenAI is offline, skipping polling');
        }
      }
    };
    fetchWalkDetails();
  }, []);

  

    useEffect(() => {
      const prevRouteName = getPrevRouteName(navigation);
      setPrevRoute(prevRouteName);
    }, [route]);

    // State for managing active tab
    const [activeTab, setActiveTab] = useState('details');

  if (!walkDetails) {
    return <Text> Loading...</Text>;
  }

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
          <Text style={{ color: '#00796b', fontSize: 16 }}>{prevRoute}</Text>
        </View>
      </TouchableOpacity>
      <Text style={styles.title}>
            {walkDetails.location}, {new Date(walkDetails.dateTime).toLocaleDateString(undefined, { dateStyle: 'medium' })} at {new Date(walkDetails.dateTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
        </Text>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity onPress={() => setActiveTab('details')} style={activeTab === 'details' ? styles.activeTab : styles.tab}>
          <Text style={styles.tabText}>Info</Text>
        </TouchableOpacity>
        {walkDetails.reward && (
          <TouchableOpacity onPress={() => setActiveTab('reward')} style={activeTab === 'reward' ? styles.activeTab : styles.tab}>
            <Text style={styles.tabText}>Reward</Text>
          </TouchableOpacity>
        )}
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
              router.back();
            }
          }}
        />
      )}

      {activeTab === 'reward' && walkDetails.reward && (
        <RewardComponent rewardInfo={walkDetails.reward} />
      )}

      {activeTab === 'chat' && (
        <ChatComponent chatId={id} user={user}/>
      )}

      {activeTab === 'about' && walkDetails.organizer && (
        <AboutComponent user={walkDetails.organizer} showRateButton={true} />
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
  textBold: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 16,
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
    marginTop: 16,
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
