import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';
import { Text } from '../components/Themed';
import { UserDetails } from '../types/UserDetails';

interface AboutComponentProps {
  user: UserDetails;
  };


const AboutComponent: React.FC<AboutComponentProps> = ({ user }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial value for opacity: 0

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.aboutContainer, { opacity: fadeAnim }]}>
      <Image 
        source={require('@/assets/images/profile.jpg')}
        style={styles.profileImage}
      />
      <Text style={styles.textBold}>{user.fullName}</Text>
      <Text style={styles.text}>{user.bio}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  aboutContainer: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 30,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#00796b',
  },
  text: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  textBold: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
});

export default AboutComponent;
