import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Image, TextInput, FlatList, Button, TouchableOpacity } from 'react-native';
import { Text } from '../../components/Themed';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Link } from 'expo-router';
import ChatComponent from '../../components/ChatComponent';
import WalkDetailsComponent from '../../components/WalkDetailsComponent';
import AboutComponent from '../../components/AboutComponent';
import { dataProxy } from '../../data/DataProxy';
import { PlannedWalk } from '../../types/PlannedWalk';
import { UserDetails } from '../../types/UserDetails';

export default function WalkDetails() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: string };

  const [walkDetails, setWalkDetails] = useState<PlannedWalk | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  useEffect(() => {
    const fetchWalkDetails = async () => {
      const walks = await dataProxy.getPlannedWalks();
      const walk = walks.find(walk => walk.id === id);
      setWalkDetails(walk || null);

      if (walk) {
        const user = await dataProxy.getUserDetailsById(walk.userId);
        setUserDetails(user || null);
      }
    };

    fetchWalkDetails();
  }, [id]);
  

    // State for managing active tab
    const [activeTab, setActiveTab] = useState('details');

  if (!walkDetails) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <Link href="/(tabs)/planned_walks" style={styles.link}>&#60; back </Link>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity onPress={() => setActiveTab('details')} style={activeTab === 'details' ? styles.activeTab : styles.tab}>
          <Text style={styles.tabText}>Details</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('chat')} style={activeTab === 'chat' ? styles.activeTab : styles.tab}>
          <Text style={styles.tabText}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('about')} style={activeTab === 'about' ? styles.activeTab : styles.tab}>
          <Text style={styles.tabText}>About Host</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'details' && (
        <WalkDetailsComponent
          walkDetails={walkDetails}
          onProfileImagePress={() => setActiveTab('about')}
          onCancelPress={() => { 
            navigation.navigate("(tabs)");
          }}
        />
      )}

      {activeTab === 'chat' && (
        <ChatComponent />
      )}

      {activeTab === 'about' && userDetails && (
        <AboutComponent user={userDetails} />
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
  link: {
    color: '#00796b',
    fontSize: 32,
    fontWeight: 'bold',
    textDecorationLine: 'none',
    marginBottom: 32,
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
