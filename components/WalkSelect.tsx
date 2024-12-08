import React, { useState, useRef, useEffect } from 'react';
import { View, FlatList, TextInput, Button, StyleSheet, Animated, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Platform, KeyboardAvoidingView } from 'react-native';
import { Text } from './Themed';

import { WalkWithDistance } from '@/types/WalkWithDistance';
import ProfileImage from './ProfileImage';
import { IconSymbol } from './ui/IconSymbol';

type WalkSelectProps = {
  walks: WalkWithDistance[];
  onWalkSelect: (walk: WalkWithDistance) => void;
};

export default function WalkSelect({walks, onWalkSelect}: WalkSelectProps) {
  const [selectedWalkIndex, setSelectedWalkIndex] = useState(0);
  const [selectedWalk, setSelectedWalk] = useState(walks[0]);

  useEffect(() => {
  }, [walks]);

  useEffect(() => {
    if (selectedWalkIndex < walks.length && selectedWalkIndex >= 0) {
      setSelectedWalk(walks[selectedWalkIndex]);
    }
  },[selectedWalkIndex, walks]);

  useEffect(() => {
    onWalkSelect(selectedWalk);
  }, [selectedWalk]);


  const handlePreviousWalk = () => {
    if (selectedWalkIndex > 0) {
      setSelectedWalkIndex(selectedWalkIndex - 1);
    }
  }

  const handleNextWalk = () => {
    if (selectedWalkIndex < walks.length - 1) {
      setSelectedWalkIndex(selectedWalkIndex + 1);
    }
  }

  return (
    <View>
      {walks.length > 0 && selectedWalk && (
        <View style={styles.container}>
          <View style={styles.inner}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TouchableOpacity onPress={handlePreviousWalk} style={{marginRight: 30}}>
                <IconSymbol 
                  name="chevron.left" 
                  size={24} 
                  color="white" 
                  style={{ opacity: selectedWalkIndex > 0 ? 1 : 0.0 }}
                />
              </TouchableOpacity>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <ProfileImage uri={selectedWalk.profileImage} style={styles.profileImage} />
              <View style={{marginLeft: 10}}>
              <Text style={{color: 'white', fontSize: 16, fontWeight: 'bold'}}>{selectedWalk.location}</Text>
                <Text style={{color: 'white'}}>
                  {new Date(selectedWalk.dateTime).toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}
                </Text>
                <Text style={{color: 'white'}}>{selectedWalk.distance.toFixed(1)}km</Text>
              </View>
            </View>
              <TouchableOpacity onPress={handleNextWalk} style={{marginLeft: 30}}>
                <IconSymbol name="chevron.right" size={24} color="white" 
                style={{ opacity: selectedWalkIndex < walks.length - 1 ? 1 : 0.0 }}/>
              </TouchableOpacity>
          </View>
        </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom:60,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    width: '100%',

  },
  inner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: 'white',
  }
});