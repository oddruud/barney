import React from 'react';
import { StyleSheet, FlatList, View } from 'react-native';
import { Text } from './Themed';
import { useState, useEffect } from 'react';
import WalkItem from './WalkItem';
import { PlannedWalk } from '../types/PlannedWalk';
import { useUser } from '@/contexts/UserContext';
import { useData } from '@/contexts/DataContext';
import { useFocusEffect } from '@react-navigation/native';
import { DeviceType, getDeviceType } from '@/utils/deviceUtils';


const deviceType = getDeviceType();

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

  const deviceType = getDeviceType();
  const userLocale = Intl.DateTimeFormat().resolvedOptions().locale;

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
      {loading ? (
        <Text style={styles.loadingText}></Text>
      ) : (
        <>
          {invitedWalks.length > 0 && (
            <>
              <FlatList
                data={invitedWalks}
                renderItem={({ item }) => renderWalkItem(item)}
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
  walkItemContainer: {
    marginBottom: 10,
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
