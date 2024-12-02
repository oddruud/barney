import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Platform, View, Animated } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { PlannedWalk } from '@/types/PlannedWalk';
import WalkItem from '@/components/WalkItem';
import { dataProxy } from '@/data/DataProxy';
import { Text } from '@/components/Themed';

// Add a new component to display walk statistics
function WalkStatistics() {
  return (
    <ThemedView style={styles.statisticsContainer}>
      <ThemedText>Total Walks: 10</ThemedText>
      <ThemedText>Total Distance: 50 km</ThemedText>
      <ThemedText>Average Speed: 5 km/h</ThemedText>
    </ThemedView>
  );
}

// Add a new component to display achievement badges
function AchievementBadges() {
  return (
    <ThemedView style={styles.badgesContainer}>
      <ThemedText type="subtitle">Achievements</ThemedText>
      <ThemedText>🏆 First Walk</ThemedText>
      <ThemedText>🥇 10 Walks</ThemedText>
      <ThemedText>🚀 50 km Milestone</ThemedText>
    </ThemedView>
  );
}

// Add a new component to display countdown to the next walk
function NextWalkCountdown({ nextWalkTime }: { nextWalkTime: Date | null }) {
  const [timeRemaining, setTimeRemaining] = React.useState('');

  React.useEffect(() => {
    if (!nextWalkTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const difference = nextWalkTime.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeRemaining('The next walk is starting now!');
        clearInterval(interval);
      } else {
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nextWalkTime]);

  return (
    <ThemedView style={styles.countdownContainer}>
      <Text style={styles.nextWalkText}>Next Walk In: {timeRemaining}</Text>
    </ThemedView>
  );
}

// Modify the RandomWalkingQuote component to include a fade-in effect
function RandomWalkingQuote() {
  const [quote, setQuote] = useState<string>('');

  // Create an animated value for opacity
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // Fetch the random quote and trigger the fade-in animation
  useEffect(() => {
    const fetchQuote = async () => {
      const randomQuote = await dataProxy.getRandomWalkingQuote();
      setQuote(randomQuote);

      // Trigger the fade-in animation after setting the quote
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000, // Duration of the fade-in effect in milliseconds
        useNativeDriver: true,
      }).start();
    };

    fetchQuote();
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.quoteContainer, { opacity: fadeAnim }]}>
      <ThemedText style={styles.customFont}>{quote}</ThemedText>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const [nextWalk, setNextWalk] = useState<PlannedWalk | null>(null);

  useEffect(() => {
    const fetchNextWalk = async () => {
      const walk = await dataProxy.getNextWalk();
      setNextWalk(walk);
    };

    fetchNextWalk();
  }, []);

  return (
    <View style={styles.container}>
      <ThemedView style={styles.titleContainer}>
        <Image
          source={require('@/assets/images/logo.jpg')}
          style={styles.image}
        />
      </ThemedView>
      <RandomWalkingQuote />
      {nextWalk && (
        <NextWalkCountdown 
          nextWalkTime={new Date(`${nextWalk.dateTime}`)} 
        />
      )}
      {nextWalk && <WalkItem item={nextWalk} showDate={true} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#e9eae4',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e9eae4',
    gap: 8,
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
  statisticsContainer: {
    padding: 16,
    backgroundColor: '#e9eae4',
    marginTop: -34,
  },
  badgesContainer: {
    padding: 16,
    backgroundColor: '#e9eae4',
  },
  image: {
    width: 300,
    height: 300,
    marginBottom: 16,
  },
  countdownContainer: {
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
    backgroundColor: '#e9eae4',
    fontFamily: 'Voltaire-Frangela',
  },
  quoteContainer: {
    padding: 16,
    backgroundColor: '#e9eae4',
    marginVertical: 16,
    borderRadius: 8,
  },
  customFont: {
    fontFamily: 'Voltaire-Frangela',
    fontSize: 24,
  },
  nextWalkText: {
    fontFamily: 'SpaceMono',
    fontSize: 16,
  },
});
