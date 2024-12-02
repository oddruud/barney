import { StyleSheet, FlatList, View } from 'react-native';
import { Text } from '../../components/Themed';
import { useState, useEffect } from 'react';
import WalkItem from '../../components/WalkItem'; // Import the new WalkItem component
import { PlannedWalk } from '../../types/PlannedWalk';
import { dataProxy } from '../../data/DataProxy';
import { useUser } from '@/contexts/UserContext';

export default function PlannedWalks() {
  const { user } = useUser();
  const [plannedWalks, setPlannedWalks] = useState<PlannedWalk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlannedWalks = async () => {
      const walks = await dataProxy.getPlannedWalksByUserId(user?.id ?? 0);
      setPlannedWalks(walks);
      setLoading(false);
    };

    fetchPlannedWalks();
  }, []);

  const today = new Date().toISOString().split('T')[0];

  const todaysWalks = plannedWalks.filter(walk => walk.dateTime.split('T')[0] === today);
  const futureWalks = plannedWalks.filter(walk => new Date(walk.dateTime.split('T')[0]) > new Date(today));

  return (
    <View style={styles.container}>
      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : (
        <>
          {todaysWalks.length > 0 && (
            <>
              <Text style={styles.title}>Today</Text>
              <FlatList
                data={todaysWalks}
                renderItem={({ item }) => <WalkItem item={item} showDate={false} />}
                keyExtractor={(item) => item.id}
                style={styles.list}
              />
            </>
          )}
          {futureWalks.length > 0 && (
            <>
              <Text style={styles.title}>Upcoming</Text>
              <FlatList
                data={futureWalks}
                renderItem={({ item }) => <WalkItem item={item} showDate={true} />}
                keyExtractor={(item) => item.id}
                style={styles.list}
              />
            </>
          )}
          {todaysWalks.length === 0 && futureWalks.length === 0 && (
            <View style={styles.noWalksContainer}>
              <Text style={styles.noWalksText}>No walks planned</Text>
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
    marginTop: 40,
    padding: 20,
    backgroundColor: '#e9eae4',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00796b', // Teal color
    marginBottom: 16,
    textAlign: 'center', // Center the title
  },
  list: {
    flex: 1,
    height: 400,
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
