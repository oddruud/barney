import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, View, TouchableOpacity } from 'react-native';
import { Text } from '../../components/Themed';
import WalkItem from '../../components/WalkItem';
import { PlannedWalk } from '../../types/PlannedWalk';
import TabButton from '../../components/TabButton';

import { useUser } from '@/contexts/UserContext';
import { useData } from '@/contexts/DataContext';
import { useFocusEffect } from '@react-navigation/native';
import { DeviceType, getDeviceType } from '@/utils/deviceUtils';

enum ActiveTab {
  Today = 'today',
  Upcoming = 'upcoming',
}

const deviceType = getDeviceType();

export default function PlannedWalks() {
  const { user } = useUser();
  const { dataProxy } = useData();
  const [plannedWalks, setPlannedWalks] = useState<PlannedWalk[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.Today);

  useFocusEffect(
    React.useCallback(() => {
      const fetchPlannedWalks = async () => {
        setLoading(true);
        const walks = await dataProxy.getJoinedWalksByUserId(user?.id ?? 0);
        setPlannedWalks(walks);
        setLoading(false);
      };

      fetchPlannedWalks();
    }, [user?.id])
  );

  const userLocale = navigator.language || 'en-US';
  const today = new Date();
  const todaysWalks = plannedWalks.filter(walk => new Date(walk.dateTime).toLocaleDateString(userLocale) === today.toLocaleDateString(userLocale));
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const futureWalks = plannedWalks.filter(walk => new Date(walk.dateTime) >= tomorrow);

  const renderWalkItem = (walk: PlannedWalk) => {
    return (
      <View style={styles.proposedWalkItemContainer}>
        {deviceType === DeviceType.Tablet && (
          <View style={styles.walkItemDate}>
            <Text style={styles.walkItemDateText}>
              {new Date(walk.dateTime).toLocaleTimeString(userLocale, { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        )}
        <WalkItem item={walk} showDate={false} animated={false} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TabButton 
          title="Today" 
          isActive={activeTab === ActiveTab.Today} 
          onPress={() => setActiveTab(ActiveTab.Today)} 
        />
        <TabButton 
          title="Upcoming" 
          isActive={activeTab === ActiveTab.Upcoming} 
          onPress={() => setActiveTab(ActiveTab.Upcoming)} 
        />
      </View>

      {loading ? (
        <Text style={styles.loadingText}></Text>
      ) : (
        <>
          {activeTab === ActiveTab.Today && todaysWalks.length > 0 && (
            <>
              <FlatList
                data={todaysWalks}
                renderItem={({ item }) => renderWalkItem(item)}
                keyExtractor={(item) => item.id}
                style={styles.list}
              />
            </>
          )}
          {activeTab === ActiveTab.Upcoming && futureWalks.length > 0 && (
            <>
              <FlatList
                data={futureWalks}
                renderItem={({ item }) => renderWalkItem(item)}
                keyExtractor={(item) => item.id}
                style={styles.listUpcoming}
              />
            </>
          )}
          {activeTab === ActiveTab.Today && todaysWalks.length === 0 && (
            <View style={styles.noWalksContainer}>
              <Text style={styles.noWalksText}>No walks planned for today</Text>
            </View>
          )}
          {activeTab === ActiveTab.Upcoming && futureWalks.length === 0 && (
            <View style={styles.noWalksContainer}>
              <Text style={styles.noWalksText}>No upcoming walks</Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e9eae4',
    marginTop: 32,
    padding:10
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
  list: {
    flex: 1,
    marginBottom: 70,
  },
  listUpcoming: {
    flex: 1,
    marginBottom: 70,
  },
  noWalksContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noWalksText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  proposedWalkItemContainer: {
    marginTop: 16,
    width: deviceType === DeviceType.Phone ? '100%' : '50%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  walkItemDate: {
    width: '30%',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginRight: 80,
    marginLeft: 50,
  },
  walkItemDateText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#00796b',
    alignSelf: 'center',
  },
});
