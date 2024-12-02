import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { UserDetails } from '../types/UserDetails';
import InteractiveStarRating from './InteractiveStarRating';

interface RateUserModalProps {
  user: UserDetails;
  visible: boolean;
  onRate: (rating: number) => void;
}

const RateUserModal: React.FC<RateUserModalProps> = ({ user, visible, onRate }) => {
  const [rating, setRating] = useState<number>(0);

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  const handleRatePress = () => {
    onRate(rating);
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={() => onRate(rating)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>Rate {user.fullName}</Text>
          
          <InteractiveStarRating count={5} onRatingChange={handleRatingChange} />

          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleRatePress}
          >
            <Text style={styles.closeButtonText}>Rate</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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

export default RateUserModal;
