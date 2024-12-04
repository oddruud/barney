import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

interface StarRatingProps {
  count: number;
  size?: number;
  color?: string;
  userCount?: number;
}

const StarRating: React.FC<StarRatingProps> = ({ count, size = 20, color = "#FFD700", userCount }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial value for opacity: 0

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500, // 1 second
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={{ flexDirection: 'row', alignItems: 'center', opacity: fadeAnim }}>
      {[...Array(count)].map((_, index) => (
        <Icon key={index} name="star" size={size} color={color} />
      ))}
      {userCount !== undefined && (
        <Text style={{ marginLeft: 8 }}>{`(${userCount})`}</Text>
      )}
    </Animated.View>
  );
};

export default StarRating;
