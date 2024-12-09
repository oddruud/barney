import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View, Animated } from 'react-native';
import * as Location from 'expo-location';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { PlannedWalk } from '@/types/PlannedWalk';
import { Quote } from '@/types/Quote';
import WalkItem from '@/components/WalkItem';
import { useUser } from '@/contexts/UserContext';
import { useData } from '@/contexts/DataContext';
import { Text } from '@/components/Themed';
import { useFocusEffect } from '@react-navigation/native';
import { Button } from '@/components/Button';
import { router } from 'expo-router';
import { WalkWithDistance } from '@/types/WalkWithDistance';
import { LocationObject } from 'expo-location';
import { UserDetailsWithDistance } from '@/types/UserDetailsWithDistance';



// Add a new component to display countdown to the next walk
function NextWalkCountdown({ nextWalkTime }: { nextWalkTime: Date | null }) {
  const [countDownText, setCountDownText] = React.useState('');

  React.useEffect(() => {
    if (!nextWalkTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const difference = nextWalkTime.getTime() - now.getTime();

      if (difference <= 0) {
        setCountDownText('Enjoy your walk!');
        clearInterval(interval);
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setCountDownText(`Next Walk In: ${days}d ${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nextWalkTime]);

  return (
    <ThemedView style={styles.countdownContainer}>
      <Text style={styles.nextWalkText}>{countDownText}</Text>
    </ThemedView>
  );
}

function RandomWalkingQuote() {
  const [quote, setQuote] = useState<Quote>({quote: '', author: ''});
  const { dataProxy } = useData();


  // Fetch the random quote and trigger the fade-in animation
  useEffect(() => {
    const fetchQuote = async () => {
      const randomQuote : Quote = await dataProxy.getRandomWalkingQuote();
      setQuote(randomQuote);
    };

    fetchQuote();
  }, []);

  return (
    <Animated.View style={[styles.quoteContainer]}>
      <ThemedText style={styles.quoteText}>{quote.quote}</ThemedText>
      <ThemedText></ThemedText>
      <ThemedText style={styles.quoteText}>-{quote.author}</ThemedText>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const { user, setUser } = useUser();
  const [users, setUsers] = useState<UserDetailsWithDistance[]>([]);
  const [nextWalk, setNextWalk] = useState<PlannedWalk | null>(null);
  const [invitations, setInvitations] = useState<PlannedWalk[]>([]);
  const [userLocation, setUserLocation] = useState<LocationObject | null>(null);
  const [walksSortedByDistance, setWalksSortedByDistance] = useState<WalkWithDistance[]>([]);
  const [closestWalk, setClosestWalk] = useState<WalkWithDistance | null>(null);
  const [hoursfromNow, setHoursFromNow] = useState<number>(0);
  const [minutesfromNow, setMinutesFromNow] = useState<number>(0);
  const { dataProxy } = useData();

  useEffect(() => {
    
  }, []);



  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUser({...user, latitude: location.coords.latitude, longitude: location.coords.longitude});


    })();
  }, []);

  useEffect(() => {
    (async () => {
      const maxDistance = 30;
      console.log("user", user);
      const users = await dataProxy.getUsersSortedByDistance(user, maxDistance);
      console.log("users-", users);
      users.forEach(user => {
        console.log(user.fullName, user.distance);
      });

      setUsers(users);
    })();
  }, [user]);


  // Reset state variables to their initial values
  useFocusEffect(
    React.useCallback(() => {
 
      const fetchNextWalk = async () => {
        const walk = await dataProxy.getNextWalkForUser(user?.id ?? 0);
        setNextWalk(walk);
      };

      fetchNextWalk();

      const fetchInvitations = async () => {
        const invitations = await dataProxy.getInvitedPlannedWalksByUserId(user?.id ?? 0);
        setInvitations(invitations);
      };

      fetchInvitations();

      const getClosestLocations = async () => {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === 'granted') {
        const currentLocation = await Location.getCurrentPositionAsync({});
        setUserLocation(currentLocation);
        const walks = await dataProxy.getWalksSortedByDistance(user, currentLocation ? currentLocation : null, new Date(), new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), 10);
        setWalksSortedByDistance(walks);
      };
        
      };

      getClosestLocations();

      return () => {
      
      };
    }, [])
  );

  useEffect(() => {
      if (walksSortedByDistance.length > 0) {
        setClosestWalk(walksSortedByDistance[0]);
      }
  }, [walksSortedByDistance]);


  useEffect(() => {
    console.log("closestWalk", closestWalk);
    const difference = (new Date(closestWalk ?  closestWalk.dateTime : new Date())).getTime() - new Date().getTime();
    const hours = Math.floor((difference / (1000 * 60 * 60)));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    setHoursFromNow(hours);
    setMinutesFromNow(minutes);
  }, [closestWalk]);


  return (
    <View style={styles.container}>
      <ThemedView style={styles.titleContainer}>
        <Image
          source={require('@/assets/images/logo.jpg')}
          style={styles.image}
        />
      </ThemedView>
      <RandomWalkingQuote />

      {users.length > 0 && (
        <View style={styles.usersContainer}>
          <Text style={styles.usersText}>
            {users.length} active {users.length === 1 ? 'user' : 'users'} nearby. 
            {users[0].fullName} is the closest at {users[0].distance.toFixed(1)}km.
          </Text>
        </View>
      )}

      {invitations.length > 0 && (
        <Button 
          title={`${invitations.length} ${invitations.length === 1 ? 'invitation' : 'invitations'}`} 
          onPress={() => router.push('/(tabs)/select_walk?tab=invites')}
          style={styles.invitationButton}
        />
      )}

      {closestWalk && (hoursfromNow > 0 || minutesfromNow > 0) && (
        <View style={styles.closestWalkContainer}>
          <Text style={styles.closestWalkText}>This walk is {hoursfromNow <=0 ? minutesfromNow : hoursfromNow} {hoursfromNow <=0 ? 'minutes' : 'hours'} from now and is {closestWalk.distance.toFixed(1)}km away:</Text>
          <WalkItem item={closestWalk} showDate={true} />
        </View>
      )}

      <View style={styles.bottomContainer}>
        {nextWalk ? (
          <>
          <View style={styles.nextWalkContainer}>
            <NextWalkCountdown 
              nextWalkTime={new Date(`${nextWalk.dateTime}`)} 
            />
            <WalkItem item={nextWalk} showDate={true} />
          </View>
          </>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    zIndex: 0,
    backgroundColor: '#e9eae4',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:  'rgba(0, 0, 0, 0.0)', // Changed to semi-transparent
    padding: 16,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 16,
    zIndex: 1,
  },
  countdownContainer: {
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.0)', // Changed to semi-transparent
    marginBottom: 16,
  },
  quoteContainer: {
    padding: 16,
    marginVertical: -40,
    zIndex: 100,
  },
  quoteText: {
    fontFamily: 'Voltaire-Frangela',
    fontSize: 18,
    color: 'gray',

  },
  nextWalkText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: '#000000',
  },
  noWalkImage: {
    width: '100%',
    height: 300,
    marginBottom: 16,
    alignSelf: 'center',
  },
  buttonRow: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  invitationButton: {
    marginHorizontal: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    alignItems: 'center',
    width: '45%',
    alignSelf: 'center',
    height: 50,
    marginTop:55,
  },
  buttonText: {
    fontFamily: 'SpaceMono',
    fontSize: 16,
    color: '#FFFFFF',
  },
  fullScreenBackgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '110%',
    height: '100%',
    zIndex:-1
  },
  bottomContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 98,
  },
  closestWalkContainer: {
    padding: 16,
  },
  nextWalkContainer: {
    padding: 16,
  },
  closestWalkText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: '#000000',
    marginBottom: 16,
  },
  usersContainer: {
    padding: 16,
    marginTop: 16,
  },
  usersText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: '#000000',
  },
});
