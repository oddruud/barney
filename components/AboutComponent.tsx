import React, { useEffect, useRef, useState } from 'react';
import { View, Image, StyleSheet, Animated, Modal, TouchableOpacity } from 'react-native';
import { Text } from '../components/Themed';
import { UserDetails } from '../types/UserDetails';
import Icon from 'react-native-vector-icons/FontAwesome';  // Import FontAwesome icons
import { Button } from './Button';

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
        <View style={styles.starContainer}>
          {[...Array(5)].map((_, index) => (
            <Icon key={index} name="star" size={20} color="#FFD700" />  // Star icons
          ))}
        </View>
        <Text style={styles.text}>{user.bio}</Text>
        <Text style={[styles.text, styles.textLeft]}>Walks Completed: {user.walksCompleted}</Text>
      </Animated.View>
      <Button title="Rate host" onPress={() => setModalVisible(true)} style={styles.rateButton} />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Rate your host</Text>
            {/* Add rating input components here */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  rateButton: {
    marginBottom: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#00796b',
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default AboutComponent;
