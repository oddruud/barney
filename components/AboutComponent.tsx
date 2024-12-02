import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';
import { Text } from '../components/Themed';
import { UserDetails } from '../types/UserDetails';
import Icon from 'react-native-vector-icons/FontAwesome';  // Import FontAwesome icons

interface AboutComponentProps {
  user: UserDetails;
};

const AboutComponent: React.FC<AboutComponentProps> = ({ user }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial value for opacity: 0

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 0,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.aboutContainer, { opacity: fadeAnim }]}>
      <Image 
        source={{ uri: user.profileImage }}
        style={styles.profileImage}
      />
      <Text style={styles.textBold}>{user.fullName}</Text>
      <View style={styles.starContainer}>
        {[...Array(5)].map((_, index) => (
          <Icon key={index} name="star" size={20} color="#FFD700" />  // Star icons
        ))}
      </View>
      <Text style={styles.text}>{user.bio}</Text>
      <Text style={[styles.text, styles.textLeft]}>Walks Completed: {user.walksCompleted}</Text>
   
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
    marginTop: 8,
  },
  textBold: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  starContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  textLeft: {
    alignSelf: 'flex-start',  // Align text to the left
  },
});

export default AboutComponent;
