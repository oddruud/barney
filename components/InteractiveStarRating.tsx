import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

interface InteractiveStarRatingProps {
  count: number;
  size?: number;
  color?: string;
  userCount?: number;
  onRatingChange?: (rating: number) => void;
}

const InteractiveStarRating: React.FC<InteractiveStarRatingProps> = ({ count, size = 20, color = "#FFD700", userCount, onRatingChange }) => {
  const [selectedRating, setSelectedRating] = useState<number>(0);

  const handleStarPress = (index: number) => {
    const newRating = index + 1;
    setSelectedRating(newRating);
    if (onRatingChange) {
      onRatingChange(newRating);
    }
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {[...Array(count)].map((_, index) => (
        <TouchableOpacity key={index} onPress={() => handleStarPress(index)}>
          <Icon
            name={index < selectedRating ? "star" : "star-o"}
            size={size}
            color={color}
          />
        </TouchableOpacity>
      ))}
      {userCount !== undefined && (
        <Text style={{ marginLeft: 8 }}>{`(${userCount})`}</Text>
      )}
    </View>
  );
};

export default InteractiveStarRating;
