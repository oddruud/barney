import React, { useState, useEffect, useRef } from 'react';
import { View, Platform, Modal, Animated } from 'react-native';
import { Map, Marker } from '@/components/Map';
import { StyleSheet } from 'react-native';
import { Button } from '@/components/Button';
import { Text } from '@/components/Themed';
import { fetchAddress } from '@/utils/geoUtils';
import { useSmartService } from '@/contexts/SmartServiceContext';
import { RouteInfo } from '@/types/RouteInfo';

interface FullscreenMapModalProps {
  title: string;
  visible: boolean;
  allowLocationSelection: boolean;
  allowRouteCreation?: boolean;
  initialLocation: {
    latitude: number;
    longitude: number;
  };
  onLocationSelect: ((location: { latitude: number; longitude: number }) => void) | null;
  onRouteCreated?: ((routeInfo: RouteInfo) => void) | null;
  onRequestClose: () => void;
}

const FullscreenMapModal: React.FC<FullscreenMapModalProps> = ({title,visible, allowLocationSelection, allowRouteCreation = false, initialLocation, onLocationSelect, onRouteCreated, onRequestClose }) => {
  const [location, setLocation] = useState(initialLocation);
  const [route, setRoute] = useState<Marker[]>([]);
  const [routeUpdated, setRouteUpdated] = useState(0);
  const [address, setAddress] = useState('');
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;
  const { smartService } = useSmartService();

  useEffect(() => {
    setRoute(route);
  }, [route]);


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
    if (!allowLocationSelection) {
      return;
    }

    const { latitude, longitude } = event.nativeEvent.coordinate;
    setLocation({ latitude, longitude });

    if (onLocationSelect) { 
      onLocationSelect({ latitude, longitude });
    }

    let address = {title: '', description: ''};
    try {
      address = await fetchAddress(latitude, longitude);
      setAddress(address.title);
    } catch (error) {
      console.error('Error fetching address:', error);
    }

    if (allowRouteCreation) { 
      const addressString = address.title + ", " + address.description;
      const routeInfo : RouteInfo | null = await smartService.createRoute(latitude, longitude,addressString, 30);
      
      if (routeInfo) {
        console.log(routeInfo.description);

        const routeMarkers = routeInfo.route.map((routeMarker, index) => { return {
          id: index.toString(),
          coordinate: {
            latitude: routeMarker.latitude,
            longitude: routeMarker.longitude,
          },
        }});
    
        //console.log("Setting route markers");
        //setRoute(routeMarkers);
        //setRouteUpdated(routeMarkers.length);
        if (onRouteCreated) {
          onRouteCreated(routeInfo);
        }
      }
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
              showRoute={true}

              markers={[{
                id: '1',
                coordinate: {
                  latitude: location.latitude,
                  longitude: location.longitude,
                },
                title: 'Selected Location',
                description: 'Tap to set details'
              }]}
              route={route}
              routeUpdated={routeUpdated}
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
            <Text style={styles.modalText}>{title}</Text>
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

export default FullscreenMapModal;
