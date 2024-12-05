import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, View, TouchableOpacity } from 'react-native';
import { Text } from '../../components/Themed';
import WalkItem from '../../components/WalkItem';
import { PlannedWalk } from '../../types/PlannedWalk';

import { useUser } from '@/contexts/UserContext';
import { useData } from '@/contexts/DataContext';
import { useFocusEffect } from '@react-navigation/native';

export default function PlannedWalks() {
  const { user } = useUser();
  const { dataProxy } = useData();
  const [plannedWalks, setPlannedWalks] = useState<PlannedWalk[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('today');

  useFocusEffect(
    React.useCallback(() => {
      const fetchPlannedWalks = async () => {
        setLoading(true);
        const walks = await dataProxy.getPlannedWalksByUserId(user?.id ?? 0);
        setPlannedWalks(walks);
        setLoading(false);
      };

      fetchPlannedWalks();
    }, [user?.id])
  );

  const today = new Date().toISOString().split('T')[0];
  const todaysWalks = plannedWalks.filter(walk => walk.dateTime.split('T')[0] === today);
  const futureWalks = plannedWalks.filter(walk => new Date(walk.dateTime.split('T')[0]) > new Date(today));

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity onPress={() => setActiveTab('today')} style={activeTab === 'today' ? styles.activeTab : styles.tab}>
          <Text style={styles.tabText}>Today</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('upcoming')} style={activeTab === 'upcoming' ? styles.activeTab : styles.tab}>
          <Text style={styles.tabText}>Upcoming</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : (
        <>
          {activeTab === 'today' && todaysWalks.length > 0 && (
            <>
              <FlatList
                data={todaysWalks}
                renderItem={({ item }) => <WalkItem item={item} showDate={false} />}
                keyExtractor={(item) => item.id}
                style={styles.list}
              />
            </>
          )}
          {activeTab === 'upcoming' && futureWalks.length > 0 && (
            <>
              <FlatList
                data={futureWalks}
                renderItem={({ item }) => <WalkItem item={item} showDate={true} />}
                keyExtractor={(item) => item.id}
                style={styles.listUpcoming}
              />
            </>
          )}
          {activeTab === 'today' && todaysWalks.length === 0 && (
            <View style={styles.noWalksContainer}>
              <Text style={styles.noWalksText}>No walks planned for today</Text>
            </View>
          )}
          {activeTab === 'upcoming' && futureWalks.length === 0 && (
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
    padding: 20,
    backgroundColor: '#e9eae4',
    marginTop: 32,
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
    marginBottom: 10,
  },
  listUpcoming: {
    flex: 1,
    marginBottom: 60,
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
});
