import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

interface StarRatingProps {
  count: number;
  size?: number;
  color?: string;
  userCount?: number;
}

const StarRating: React.FC<StarRatingProps> = ({ count, size = 20, color = "#FFD700", userCount }) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {[...Array(count)].map((_, index) => (
        <Icon key={index} name="star" size={size} color={color} />
      ))}
      {userCount !== undefined && (
        <Text style={{ marginLeft: 8 }}>{`(${userCount})`}</Text>
      )}
    </View>
  );
};

export default StarRating;
