import React, { useState, useEffect, useRef } from 'react';
import { View, Platform, Modal, Animated } from 'react-native';
import { Map } from '@/components/Map';
import { StyleSheet } from 'react-native';
import { Button } from '@/components/Button';
import { Text } from '@/components/Themed';
import { fetchAddress } from '@/utils/geoUtils';

interface SelectOnMapModalProps {
  visible: boolean;
  initialLocation: {
    latitude: number;
    longitude: number;
  };
  onLocationSelect: (location: { latitude: number; longitude: number }) => void;
  onRequestClose: () => void;
}

const SelectOnMapModal: React.FC<SelectOnMapModalProps> = ({visible, initialLocation, onLocationSelect, onRequestClose }) => {
  const [location, setLocation] = useState(initialLocation);
  const [address, setAddress] = useState('');
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setLocation({ latitude, longitude });
    onLocationSelect({ latitude, longitude });

    try {
      const address = await fetchAddress(latitude, longitude);
      setAddress(address.title);
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={() => {}}
    >
      <Animated.View style={{ flex: 1, opacity, transform: [{ scale }] }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
          {Platform.OS !== 'web' && (
            <Map
              showUserLocation={true}
              markers={[{
                id: '1',
                coordinate: {
                  latitude: location.latitude,
                  longitude: location.longitude,
                },
                title: 'Selected Location',
                description: 'Tap to set details'
              }]}
              height="100%"
              width="100%"
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.010,
                longitudeDelta: 0.010,
              }}
              onPress={handleMapPress}
            />
          )}
          <Button style={styles.modalCloseButton} title="Close" onPress={onRequestClose} />
          <View style={styles.modalTextContainer}>
            <Text style={styles.modalText}>Place a pin on the map to select the walk start location</Text>
          </View>

          {address && (
            <View style={styles.modalAddressContainer}>
              <Text style={styles.modalAddressText}>{address}</Text>
            </View>
          )}
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
    modalCloseButton: {
        marginTop: 20,
        width: 100,
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
    },
    modalText: {
      fontSize: 16,
      textAlign: 'center',
    },
    modalTextContainer: {
      position: 'absolute',
      top: 80,
      backgroundColor: 'white',
      padding: 10,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    modalAddressContainer: {
      position: 'absolute',
      bottom: 120,
      backgroundColor: 'white',
      padding: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    modalAddressText: {
      fontSize: 16,
      textAlign: 'center',
    }
  });

export default SelectOnMapModal;
