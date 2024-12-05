import React from 'react';
import { StyleSheet, FlatList, View } from 'react-native';
import { Text } from './Themed';
import { useState, useEffect } from 'react';
import WalkItem from './WalkItem';
import { PlannedWalk } from '../types/PlannedWalk';
import { useUser } from '@/contexts/UserContext';
import { useData } from '@/contexts/DataContext';
import { useFocusEffect } from '@react-navigation/native';

export default function InviteView() {
  const { user } = useUser();
  const [invitedWalks, setInvitedWalks] = useState<PlannedWalk[]>([]);
  const [loading, setLoading] = useState(true);
  const { dataProxy } = useData();
  const fetchInvitedWalks = async () => {
    setLoading(true);
    const walks = await dataProxy.getInvitedPlannedWalksByUserId(user?.id ?? 0);
    setInvitedWalks(walks);
    setLoading(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchInvitedWalks();
    }, [user?.id])
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : (
        <>
          {invitedWalks.length > 0 && (
            <>
              <FlatList
                data={invitedWalks}
                renderItem={({ item }) => <WalkItem item={item} showDate={true} />}
                keyExtractor={(item) => item.id}
                style={styles.list}
              />
            </>
          )}
  
          {invitedWalks.length === 0 && (
            <View style={styles.noWalksContainer}>
              <Text style={styles.noWalksText}>No Pending Invites</Text>
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
