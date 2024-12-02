import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Platform, View, Animated } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { PlannedWalk } from '@/types/planned_walk';
import WalkItem from '@/components/WalkItem';

import { Link } from 'expo-router';
import { dataProxy } from '@/data/DataProxy';

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
      <ThemedText>Next Walk In: {timeRemaining}</ThemedText>
    </ThemedView>
  );
}

// Modify the RandomWalkingQuote component to include a fade-in effect
function RandomWalkingQuote() {
  const quotes = [
    "Walking is the best possible exercise. Habituate yourself to walk very far. \n\n- Thomas Jefferson",
    "An early-morning walk is a blessing for the whole day. \n\n- Henry David Thoreau",
    "Walking is man's best medicine. \n\n- Hippocrates",
    "All truly great thoughts are conceived while walking. \n\n- Friedrich Nietzsche",
    "The journey of a thousand miles begins with one step. \n\n- Lao Tzu"
  ];

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  // Create an animated value for opacity
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // Use useEffect to trigger the fade-in animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000, // Duration of the fade-in effect in milliseconds
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.quoteContainer, { opacity: fadeAnim }]}>
      <ThemedText style={styles.customFont}>{randomQuote}</ThemedText>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const [latestWalk, setLatestWalk] = useState<PlannedWalk | null>(null);

  useEffect(() => {
    const fetchLatestWalk = async () => {
      const walk = await dataProxy.getLatestWalk();
      setLatestWalk(walk);
    };

    fetchLatestWalk();
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
      <NextWalkCountdown 
        nextWalkTime={latestWalk ? new Date(`${latestWalk.date}T${latestWalk.time}`) : null} 
      />
      {latestWalk && <WalkItem item={latestWalk} showDate={true} />}
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
});
