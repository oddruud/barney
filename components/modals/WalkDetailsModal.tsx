import React, { useRef, useEffect } from 'react';
import { View, Modal, StyleSheet, Animated, Image } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Text } from '@/components/Themed';
import { Button } from '@/components/Button';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { PlannedWalk } from '@/types/PlannedWalk';

interface WalkDetailsModalProps {
  visible: boolean;
  walk: PlannedWalk | null;
  onClose: () => void;
  onCheckOut: () => void;
}

const WalkDetailsModal: React.FC<WalkDetailsModalProps> = ({ visible, walk, onClose, onCheckOut }) => {
  const scaleValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    } else {
      scaleValue.setValue(0);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <Animated.View style={[styles.modalContent, { transform: [{ scale: scaleValue }] }]}>
          <ThemedView style={styles.walkHeader}>
            <Text style={styles.walkHeaderText}>
              {walk?.location}
            </Text>
          </ThemedView>
          <Text style={styles.textBold}>{new Date(walk?.dateTime ?? '').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at {walk?.dateTime.split('T')[1].slice(0, 5)}</Text>
          <Text style={styles.descriptionText}>{walk?.description}</Text>
          <View style={styles.durationContainer}>
            <IconSymbol name="timer" size={16} color="#333" style={styles.icon} />
            <ThemedText>{walk?.duration ? walk?.duration * 60 : 0} minutes   </ThemedText>
            <IconSymbol name="person" size={16} color="#333" style={styles.icon} />
            <ThemedText>{walk?.joinedUserIds.length} / {walk?.maxParticipants}</ThemedText>
          </View>
          <View style={styles.userInfoContainer}>
            <Image
              source={{ uri: walk?.profileImage }}
              style={styles.profileImage}
            />
            <ThemedText>with {walk?.username}</ThemedText>
          </View>
          <View style={styles.buttonRow}>
            <Button
              title="Check out"
              onPress={onCheckOut}
              style={styles.checkOutButton}
            />
            <Button
              title="Close"
              onPress={onClose}
              style={styles.closeButton}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    alignItems: 'center',
  },
  walkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  textBold: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  walkHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  descriptionText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
  },
  icon: {
    marginRight: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  checkOutButton: {
    marginTop: 15,
  },
  closeButton: {
    marginTop: 10,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 10,
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
});

export default WalkDetailsModal;
