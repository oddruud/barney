import { StyleSheet, Dimensions, Linking, Platform, Image, StyleProp, ViewStyle, ImageStyle } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import * as Location from 'expo-location';
import MapView from 'react-native-maps';
import CachedImage from './CachedImage';


export type Marker = {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title?: string;
  description?: string;
  image?: string;
  imageStyle?: StyleProp<ImageStyle>;
};

type Props = {
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
    zoomLevel?: number;
  };
  markers?: Marker[];
  route?: Marker[];
  showUserLocation?: boolean;
  width?: number | string;
  height?: number | string;
  style?: StyleProp<ViewStyle>;
  onMarkerPress?: (marker: Marker) => void;
  showRoute?: boolean;
  routeUpdated?: number;
  onPress?: (event: {
    nativeEvent: {
      coordinate: {
        latitude: number;
        longitude: number;
      };
    };
  }) => void;
};

export function Map({ 
  initialRegion = {
    latitude: 41.1579,
    longitude: -8.6291,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
    zoomLevel: 3,
  },
  markers = [],
  route = [],
  showUserLocation = false,
  width = Dimensions.get('window').width,
  height = 600,
  onMarkerPress,
  showRoute = false,
  routeUpdated,
  style,
  onPress
}: Props) {
  const [userLocation, setUserLocation] = useState<Marker['coordinate'] | null>(null);
  const [routeMarkers, setRouteMarkers] = useState<Marker[]>(route);
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    (
        
     async () => {
        if (showUserLocation) {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setUserLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                });
        }
      }
    )();
  }, [userLocation]);

  useEffect(() => {
    if (mapRef.current) {
      const zoomFactor = initialRegion.zoomLevel || 1;
      const adjustedRegion = {
        ...initialRegion,
        latitudeDelta: initialRegion.latitudeDelta / zoomFactor,
        longitudeDelta: initialRegion.longitudeDelta / zoomFactor,
      };

      animateToRegion(adjustedRegion);
    }
  }, [initialRegion]);

  useEffect(() => {
    setRouteMarkers(route);
  }, [routeUpdated]);

  const animateToRegion = (region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(region, 1000); // 1000 ms for animation duration
    }
  };

  if (Platform.OS === 'web') {
    return null;
  }

  // Only import MapView and Marker when actually needed (on native platforms)
  const MapView = require('react-native-maps').default;
  const { Marker, Polyline } = require('react-native-maps');

  // Calculate latitudeDelta and longitudeDelta based on zoomLevel
  const zoomFactor = initialRegion.zoomLevel || 1; //Math.pow(2, 20 - (initialRegion.zoomLevel || 10));
  const adjustedRegion = {
    ...initialRegion,
    latitudeDelta: initialRegion.latitudeDelta / zoomFactor,
    longitudeDelta: initialRegion.longitudeDelta / zoomFactor,
  };

  return (
    <MapView 
      ref={mapRef}
      style={[
        {
          width,
          height
        },
        style
      ]}
      initialRegion={adjustedRegion}
      onPress={onPress}
      mapType={'standard'}
    >
      {showRoute && routeMarkers.length > 1 && (
        <Polyline
          coordinates = {routeMarkers.map(routeMarker => routeMarker.coordinate)}
          strokeColor = "#ff0000"
          strokeWidth = {3}
        />
      )}
      {markers.map(marker => (
        <Marker
          key={marker.id}
          coordinate={marker.coordinate}
          title={marker.title}
          description={marker.description}
          onPress={() => onMarkerPress?.(marker)}
        >
          {marker.image && <CachedImage url={marker.image} style={[styles.markerImage, marker.imageStyle]} />}
        </Marker>
      ))}

{userLocation && showUserLocation && (
        <Marker
          coordinate={userLocation}
          title="You"
        >
            <Image
                source={require('../assets/images/circle.png')}
                style={{ width: 20 , height: 20 }}
            />
        </Marker>
      )}
    </MapView>
  );
}

export { Marker};

const styles = StyleSheet.create({
  markerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 5,
    borderColor: 'rgba(255, 255, 255, 1.0)',
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowOffset: { width: 0, height: 2 },
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 5,
  },
});
