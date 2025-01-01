import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Themed';
import { useRoute, useNavigation } from '@react-navigation/native';
import ChatComponent from '@/components/ChatComponent';
import WalkDetailsComponent from '@/components/WalkDetailsComponent';
import AboutComponent from '@/components/AboutComponent';
import { PlannedWalk } from '@/types/PlannedWalk';
import { useUser } from '@/contexts/UserContext';
import { router } from 'expo-router';
import { useData } from '@/contexts/DataContext';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { getPrevRouteName } from '@/utils/routeUtils';
import RewardComponent from '@/components/RewardComponent';
import { useGenAI } from '@/contexts/GenAIContext';
import TabButton from '@/components/TabButton';
import { DeviceType, getDeviceType } from '@/utils/deviceUtils';
type TabType = 'details' | 'reward' | 'chat' | 'about';

const BackButton = ({ prevRoute, onPress }: { prevRoute: string | null, onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={{ marginRight: 30 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <IconSymbol name="chevron.left" size={24} color="#00796b" style={{ opacity: 1 }} />
      <Text style={{ color: '#00796b', fontSize: 16 }}>{prevRoute}</Text>
    </View>
  </TouchableOpacity>
);

enum WalkAction {
  Join = 'join',
  Unsubscribe = 'unsubscribe',
  Cancel = 'cancel',
  Decline = 'decline',
}

const deviceType = getDeviceType();

export default function WalkDetails() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: string };
  const { user } = useUser();
  const { dataProxy } = useData();
  const { genAIService } = useGenAI();
  
  const [walkDetails, setWalkDetails] = useState<PlannedWalk | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [prevRoute, setPrevRoute] = useState<string | null>(null);

  useEffect(() => {
    const prevRouteName = getPrevRouteName(navigation);
    setPrevRoute(prevRouteName);
  }, [route]);

  useEffect(() => {
    let isMounted = true;
    
    const pollForReward = async () => {
      if (!walkDetails?.reward) {
        const genAIIsOnline = await genAIService.pingServer();
        if (genAIIsOnline && isMounted) {
          await new Promise(resolve => setTimeout(resolve, 3000));
          fetchWalkDetails();
        }
      }
    };

    const fetchWalkDetails = async () => {
      const walk = await dataProxy.getPlannedWalk(id);
      if (isMounted) {
        setWalkDetails(walk);
        pollForReward();
      }
    };

    fetchWalkDetails();
    return () => { isMounted = false; };
  }, [id]);

  const handleWalkAction = async (action: WalkAction) => {
    if (!user || !walkDetails) return;

    switch (action) {
      case WalkAction.Join:
        const updatedWalk = await dataProxy.joinWalk(walkDetails.id, user.id);
        await dataProxy.declineInvite(walkDetails.id, user.id);
        setWalkDetails(updatedWalk);
        break;
      case WalkAction.Unsubscribe:
        const newWalkDetails = await dataProxy.unsubscribeFromWalk(walkDetails.id, user.id);
        setWalkDetails(newWalkDetails);
        break;
      case WalkAction.Cancel:
        await dataProxy.cancelPlannedWalk(walkDetails.id);
        router.back();
        break;
      case WalkAction.Decline:
        await dataProxy.declineInvite(walkDetails.id, user.id);
        router.back();
        break;
    }
  };

  if (!walkDetails) {
    return <Text>Loading...</Text>;
  }

  const formatDateTime = (date: Date) => {
    return `${date.toLocaleDateString(undefined, { dateStyle: 'medium' })} at ${
      date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    }`;
  };

  return (
    <View style={styles.container}>
      <BackButton prevRoute={prevRoute} onPress={() => router.back()} />
      
      <Text style={styles.title}>
        {walkDetails.location}, {formatDateTime(new Date(walkDetails.dateTime))}
      </Text>

      <View style={styles.tabContainer}>
        <TabButton 
          title="Info" 
          isActive={activeTab === 'details'} 
          onPress={() => setActiveTab('details')} 
        />
        {walkDetails.reward && (
          <TabButton 
            title="Reward" 
            isActive={activeTab === 'reward'} 
            onPress={() => setActiveTab('reward')} 
          />
        )}
        <TabButton 
          title="Chat" 
          isActive={activeTab === 'chat'} 
          onPress={() => setActiveTab('chat')} 
        />
        <TabButton 
          title="About Organizer" 
          isActive={activeTab === 'about'} 
          onPress={() => setActiveTab('about')} 
        />
      </View>

      {activeTab === 'details' && (
        <WalkDetailsComponent
          walkDetails={walkDetails}
          user={user}
          onProfileImagePress={() => setActiveTab('about')}
          onCancelPress={() => handleWalkAction(WalkAction.Unsubscribe)}
          onJoinPress={() => handleWalkAction(WalkAction.Join)}
          onDeclineInvite={() => handleWalkAction(WalkAction.Decline)}
        />
      )}

      {activeTab === 'reward' && walkDetails.reward && (
        <RewardComponent rewardInfo={walkDetails.reward} />
      )}

      {activeTab === 'chat' && (
        <ChatComponent chatId={id} user={user} />
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
  title: {
    fontSize: deviceType === DeviceType.Phone ? 16 : 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 16,
    marginTop: 16,
  },
});
