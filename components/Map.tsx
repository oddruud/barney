import { StyleSheet, Dimensions, Linking, Platform } from 'react-native';

type Marker = {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title?: string;
  description?: string;
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
  width?: number | string;
  height?: number | string;
  onMarkerPress?: (marker: Marker) => void;
  showRoute?: boolean;
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
  width = Dimensions.get('window').width,
  height = 600,
  onMarkerPress,
  showRoute = false,
  onPress
}: Props) {
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
      style={{
        width,
        height
      }}
      initialRegion={adjustedRegion}
      onPress={onPress}
    >
      {showRoute && markers.length > 1 && (
        <Polyline
          coordinates={markers.map(marker => marker.coordinate)}
          strokeColor="#000" // Black line
          strokeWidth={2}
        />
      )}
      {markers.map(marker => (
        <Marker
          key={marker.id}
          coordinate={marker.coordinate}
          title={marker.title}
          description={marker.description}
          onPress={() => onMarkerPress?.(marker)}
        />
      ))}
    </MapView>
  );
}

export { Marker };
