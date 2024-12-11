import React, { useState, useRef, useEffect } from 'react';
import { View, FlatList, TextInput, Button, StyleSheet, Animated, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Platform, KeyboardAvoidingView, StyleProp, ViewStyle } from 'react-native';
import { Text } from './Themed';

import { WalkWithDistance } from '@/types/WalkWithDistance';
import ProfileImage from './ProfileImage';
import { IconSymbol } from './ui/IconSymbol';

type WalkSelectProps = {
  walks: WalkWithDistance[];
  style?: StyleProp<ViewStyle>;
  onWalkSelect: (walk: WalkWithDistance) => void;
  onChooseWalk: (walk: WalkWithDistance) => void;
};

export default function WalkSelect({walks, onWalkSelect, onChooseWalk, style}: WalkSelectProps) {
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

  const handleSelectWalk = () => {
    onChooseWalk(selectedWalk);
  }

  return (
    <View style={[styles.container, style]}>
      {walks.length > 0 && selectedWalk && (
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
              <TouchableOpacity onPress={handleSelectWalk}>
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
            </TouchableOpacity>
             
              <TouchableOpacity onPress={handleNextWalk} style={{marginLeft: 30}}>
                <IconSymbol name="chevron.right" size={24} color="white" 
                style={{ opacity: selectedWalkIndex < walks.length - 1 ? 1 : 0.0 }}/>
              </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    width: '110%',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom:81,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  inner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 16,
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