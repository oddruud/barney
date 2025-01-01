import React from 'react';
import { View, Modal, StyleSheet } from 'react-native';
import { Text } from '@/components/Themed';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/Button';
import { DeviceType, getDeviceType } from '@/utils/deviceUtils';

const deviceType = getDeviceType();

interface FiltersModalProps {
  isVisible: boolean;
  startDate: Date;
  endDate: Date;
  onStartDateChange: (event: any, date?: Date) => void;
  onEndDateChange: (event: any, date?: Date) => void;
  onClose: () => void;
}

const FiltersModal: React.FC<FiltersModalProps> = ({
  isVisible,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClose,
}) => {
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Filters</Text>
          <ThemedView style={styles.dateContainer}>
            <Text style={styles.label}>Between:</Text>
            <DateTimePicker
              value={startDate || new Date()}
              mode="date"
              display="default"
              onChange={onStartDateChange}
            />
          </ThemedView>
          <ThemedView style={styles.dateContainer}>
            <Text style={styles.label}>And:</Text>
            <DateTimePicker
              value={endDate || new Date(new Date().setDate(new Date().getDate() + 7))}
              mode="date"
              display="default"
              onChange={onEndDateChange}
            />
          </ThemedView>
          <Button title="Close" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: deviceType === DeviceType.Tablet ? '50%' : '90%',
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.0)',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    width: 100,
    marginRight: 10,
  },
});

export default FiltersModal;
