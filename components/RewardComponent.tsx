import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { RewardInfo } from '../types/RewardInfo';
import CachedImage from './CachedImage';

interface RewardComponentProps {
  rewardInfo: RewardInfo;
}

const RewardComponent: React.FC<RewardComponentProps> = ({ rewardInfo }) => {
  return (
    <View style={styles.container}>
      <CachedImage url={rewardInfo.image} style={styles.image} />
      <Text style={styles.name}>{rewardInfo.name.replace(/['"]/g, '')}</Text>
      <Text style={styles.description}>{rewardInfo.description.replace(/['"]/g, '')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 8,
    marginBottom: 16,
    alignSelf: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
});

export default RewardComponent;
