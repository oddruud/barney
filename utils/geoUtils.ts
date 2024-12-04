import * as Location from 'expo-location';
// Define the haversineDistance function
const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  };

// Define the fetchAddress function
const fetchAddress = async (latitude: number, longitude: number) => {
  try {
    const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
    return {
      title: address.name || '',
      description: `${address.street}, ${address.city}, ${address.region}, ${address.country}`
    };
  } catch (error) {
    console.error("Error fetching address:", error);
    return {
      title: '',
      description: ''
    };
  }
};

export { haversineDistance, fetchAddress };