import React, { useEffect, useRef, useState } from 'react';
import { View, Image, StyleSheet, Animated, Modal, TouchableOpacity } from 'react-native';
import { Text } from '../components/Themed';
import { UserDetails } from '../types/UserDetails';
import { Button } from './Button';
import StarRating from './StarRating';  // Import the new StarRating component
import RateUserModal from './RateUserModal';  // Import the new modal component

interface AboutComponentProps {
  user: UserDetails;
};

const AboutComponent: React.FC<AboutComponentProps> = ({ user }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial value for opacity: 0
  const [modalVisible, setModalVisible] = useState(false); // State for modal visibility

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 0,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.aboutContainer, { opacity: fadeAnim }]}>
        <Image 
          source={{ uri: user.profileImage }}
          style={styles.profileImage}
        />
        <Text style={styles.textBold}>{user.fullName}</Text>
        <Text style={styles.text}>Active Since: {new Date(user.activeSince).toLocaleDateString()}</Text>
        <Text style={styles.text}>Walks Completed: {user.walksCompleted}</Text>
        <StarRating count={parseInt(user.rating.toFixed(1))} userCount={user.numberOfRatings} /> 
        
        <Text style={styles.bioText}>{user.bio}</Text>
       
      </Animated.View>
      <Button title={`Rate ${user.fullName}`} onPress={() => setModalVisible(true)} style={styles.rateButton} />

      <RateUserModal user={user} visible={modalVisible} onRate={(rating:number) => {
        setModalVisible(false)
        console.log(rating)
        //dataProxy.rateUser(user.id, rating)
      }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
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
    marginBottom: 4,
    marginTop: 4,
  },
  bioText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
    marginTop: 16,
    fontStyle: 'italic',
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
  rateButton: {
    marginBottom: 20,
  },
});

export default AboutComponent;
