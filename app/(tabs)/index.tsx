import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View, Animated, Share } from 'react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

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
import {useSettings} from '@/contexts/SettingsContext';
import { formatDistance } from '@/utils/stringUtils';

function getCountDownText(date: Date): string {
  const difference = date.getTime() - new Date().getTime();
  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  if (days > 0) {
    return `${days} days`;
  } else if (hours > 0) {
    return `${hours} hours`;
  } else if (minutes > 0) {
    return `${minutes} minutes`;
  } else {
    return `${seconds} seconds`;
  }
  
  return '';
}

// Add a new component to display countdown to the next walk
function NextWalkCountdown({ prefix, nextWalkTime }: { prefix: string, nextWalkTime: Date | null }) {
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
        setCountDownText(prefix + getCountDownText(nextWalkTime));
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
      <ThemedText style={styles.quoteText}>- {quote.author}</ThemedText>
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
  const { settings} = useSettings();

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
      setUser({...user, latitude: location.coords.latitude, longitude: location.coords.longitude, lastCheckIn: new Date().toISOString()});

      // Request notification permissions
      const { status: notificationStatus } = await Notifications.requestPermissionsAsync();
      if (notificationStatus === 'granted') {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Let's walk",
            body: 'You have a walk coming up!',
          },
          trigger: null, // null means show immediately
        });
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const maxDistance = settings.searchRadius;
      const users = await dataProxy.getUsersSortedByDistance(user, maxDistance);
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

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: "Let's walk together! Check out this app to find walking buddies and join planned walks.",
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ThemedView style={styles.titleContainer}>
        <Image
          source={require('@/assets/images/logo.jpg')}
          style={styles.image}
        />
      </ThemedView>
      <RandomWalkingQuote />

      {users.length > 0 && users.length < 100 && invitations.length === 0 && (
        <View style={styles.usersContainer}>
          <Text style={styles.usersTitle}>
            {users.length} {users.length === 1 ? 'person' : 'people'} active in your area.  
          </Text>
          <Text style={styles.usersText}>
            You may want to share 'Let's walk' with your friends.
          </Text>
          <Button 
            title="Share" 
            onPress={handleShare}
            style={styles.shareButton}
          />
        </View>
      )}

      {invitations.length > 0 && (
        <Button 
          title={`${invitations.length} ${invitations.length === 1 ? 'invitation' : 'invitations'}`} 
          onPress={() => router.push('/(tabs)/select_walk?tab=invites')}
          style={styles.invitationButton}
        />
      )}

 

      <View style={styles.bottomContainer}>
        {nextWalk ? (
          <>
          <View style={styles.proposedWalkContainer}>
          <Text style={styles.proposedWalkTitle}>Your next walk</Text>
            <NextWalkCountdown 
              prefix = "Next walk in "   nextWalkTime={new Date(`${nextWalk.dateTime}`)} 
            />
            <WalkItem item={nextWalk} showDate={true} animated={true} />
          </View>
          </>
        ) : null}

      {!nextWalk && closestWalk && (
        <View style={styles.proposedWalkContainer}>
          <Text style={styles.proposedWalkTitle}>Joinable walk</Text>
           <NextWalkCountdown 
              prefix = {`${formatDistance(closestWalk.distance)} from you, starting in `} 
              nextWalkTime={new Date(`${closestWalk.dateTime}`)} 
            />
          <WalkItem item={closestWalk} showDate={true} animated={true} />
        </View>
      )}

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
    textAlign: 'center',
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
    marginTop:75,
  },
  shareButton: {
    marginHorizontal: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    alignItems: 'center',
    width: '45%',
    alignSelf: 'center',
    height: 50,
    marginTop:16,
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
  proposedWalkContainer: {
    padding: 16,
  },
  closestWalkText: {
    fontSize: 12,
    color: '#000000',
    marginBottom: 16,
  },
  usersContainer: {
    padding: 16,
    marginTop: 64,

  },
  usersText: {
    fontSize: 12,
    color: '#000000',
    textAlign: 'center',
  },
  usersTitle: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  proposedWalkTitle: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});