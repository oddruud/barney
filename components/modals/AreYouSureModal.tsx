import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { Button } from '../Button';

interface AreYouSureModalProps {
  visible: boolean;
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const AreYouSureModal: React.FC<AreYouSureModalProps> = ({ visible, title, onConfirm, onCancel }) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>{title}</Text>
          <View style={styles.modalButtons}>
            <Button title="Yes" onPress={onConfirm} style={styles.modalButtonYes} />
            <Button title="No" onPress={onCancel} style={styles.modalButton} />
          </View>
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
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    marginHorizontal: 10,
    width: '45%',
  },
  modalButtonYes: {
    marginHorizontal: 10,
    backgroundColor: '#ff0000',
    width: '45%',
  },
});

export default AreYouSureModal;
