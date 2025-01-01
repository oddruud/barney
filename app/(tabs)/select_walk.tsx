import React, {useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '../../components/Themed';
import SelectWalkInArea from '../../components/SelectWalkInArea';
import InviteView from '../../components/InviteView';
import PeopleList from '../../components/PeopleList';
import { useUser } from '@/contexts/UserContext';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSettings } from '@/contexts/SettingsContext';
import TabButton from '../../components/TabButton';

// Define an enum for the tab names
enum TabNames {
  MyArea = 'myArea',
  Invites = 'invites',
  PeopleInYourArea = 'peopleinyourarea',
}

export default function SelectWalkScreen() {
  // State for managing active tab using the enum
  const [activeTab, setActiveTab] = useState<TabNames>(TabNames.MyArea);
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useUser();
  const { settings } = useSettings();

  useEffect(() => {
    if (route.params) {
      const { tab } = route.params as { tab: string };

      if (tab && Object.values(TabNames).includes(tab as TabNames)) {
        setActiveTab(tab as TabNames);
      }
    }
  }, [route]);

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TabButton 
          title="Find Walks" 
          isActive={activeTab === TabNames.MyArea} 
          onPress={() => setActiveTab(TabNames.MyArea)} 
        />
        <TabButton 
          title="Invites" 
          isActive={activeTab === TabNames.Invites} 
          onPress={() => setActiveTab(TabNames.Invites)} 
        />
        <TabButton 
          title="People in your area" 
          isActive={activeTab === TabNames.PeopleInYourArea} 
          onPress={() => setActiveTab(TabNames.PeopleInYourArea)} 
        />
      </View>

      {/* Tab Content */}
      {activeTab === TabNames.MyArea && (
        <SelectWalkInArea initialStartDate={new Date()} initialEndDate={new Date(new Date().setDate(new Date().getDate() + 7))} />
      )}

      {activeTab === TabNames.Invites && (
        <InviteView />
      )}

      {activeTab === TabNames.PeopleInYourArea && (
        <PeopleList user={user} searchRadius={settings.searchRadius}/>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 32,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 16,
    padding: 10,
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
