import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View, Animated } from 'react-native';

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
  const { user } = useUser();
  const [nextWalk, setNextWalk] = useState<PlannedWalk | null>(null);
  const [invitations, setInvitations] = useState<PlannedWalk[]>([]);
  const { dataProxy } = useData();

  useEffect(() => {
    
  }, []);


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

      return () => {
      
      };
    }, [])
  );

  return (
    <View style={styles.container}>
      <ThemedView style={styles.titleContainer}>
        <Image
          source={require('@/assets/images/logo.jpg')}
          style={styles.image}
        />
      </ThemedView>
      <RandomWalkingQuote />

      {invitations.length === 0 && (
        <Button 
          title={`${invitations.length} ${invitations.length === 1 ? 'invitation' : 'invitations'}`} 
          onPress={() => router.push('/(tabs)/select_walk?tab=invites')}
          style={styles.invitationButton}
        />
      )}

      <View style={styles.bottomContainer}>
        {nextWalk ? (
          <>
            <NextWalkCountdown 
              nextWalkTime={new Date(`${nextWalk.dateTime}`)} 
            />
            <WalkItem item={nextWalk} showDate={true} />
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
    width: 300,
    height: 300,
    marginBottom: 16,
    zIndex: 1,
  },
  countdownContainer: {
    padding: 16,
    marginVertical: 16,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.0)', // Changed to semi-transparent
    marginTop: 32,
  },
  quoteContainer: {
    padding: 16,
    marginVertical: -16,
    zIndex: 100,
  },
  quoteText: {
    fontFamily: 'Voltaire-Frangela',
    fontSize: 24,
    color: '#000000',

  },
  nextWalkText: {
    fontFamily: 'SpaceMono',
    fontSize: 16,
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
    marginTop: 32,
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
});
