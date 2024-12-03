import { StyleSheet, Image, Platform, Switch, TouchableOpacity, TextInput, Dimensions, Modal, View, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useEffect } from 'react';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useState } from 'react';
import { Button } from '@/components/Button';
import { Text } from '@/components/Themed';
import StarRating from '@/components/StarRating';
import { dataProxy } from '@/data/DataProxy';
import LocalUserData from '@/data/LocalData';
import { useUser } from '@/contexts/UserContext';
import { router } from 'expo-router';

const windowHeight = Dimensions.get('window').height;

export default function ProfileScreen() {
  const { user, setUser } = useUser();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [bio, setBio] = useState('');
  const [name, setName] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    
    if (user) {
      setName(user.fullName);
      setBio(user.bio);
      setProfileImage(user.profileImage);
    }
  }, [user]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {

    setIsModalVisible(true);
    const updatedUser = await dataProxy.updateUserProfile(
      user?.id ?? 0,
      name ?? '',
      bio ?? '',
      profileImage ?? ''
    );
    
    if (updatedUser) {
      LocalUserData.getInstance().saveUserData(updatedUser);
      setUser(updatedUser);
    }

    setTimeout(() => {
      setIsModalVisible(false);
    }, 1000);
  };

  const handleLogout = () => {
    LocalUserData.getInstance().clearUserData();
    router.replace("/login");
  };

  return (
  <ThemedView>
    <Modal
      transparent={true}
      visible={isModalVisible}
      animationType="fade"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ThemedText>Changes Saved!</ThemedText>
        </View>
      </View>
    </Modal>
    <ThemedView style={styles.container}>
      <TouchableOpacity onPress={pickImage} style={styles.profileImageContainer}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        ) : (
          <ThemedView style={styles.profileImagePlaceholder}>
            <ThemedText>Tap to add photo</ThemedText>
          </ThemedView>
        )}
      </TouchableOpacity>
      <ThemedView style={styles.nameContainer}>
        <ThemedText style={styles.label}>Name</ThemedText>
        <TextInput
          style={styles.nameInput}
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
          placeholderTextColor="#808080"
        />
      </ThemedView>
      <ThemedView style={styles.descriptionContainer}>
        <ThemedText style={styles.label}>About Me</ThemedText>
        <TextInput
          style={styles.descriptionInput}
          multiline
          placeholder="Tell us about yourself..."
          value={bio}
          onChangeText={setBio}
          placeholderTextColor="#808080"
        />
      </ThemedView>

      <ThemedView style={styles.ratingContainer}>
        <ThemedText style={styles.label}>Rating</ThemedText>
        <StarRating count={parseInt(user.rating.toFixed(1))} userCount={user.numberOfRatings} size={30} color="#FFD700"  />
      </ThemedView>

      <Button 
        title="Save Changes" 
        onPress={handleSave}
        style={styles.saveButton}
      />

      <Button 
        title="Logout" 
        onPress={handleLogout}
        style={styles.logoutButton}
      />
    </ThemedView>
  </ThemedView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00796b', // Teal color
    marginBottom: 16,
    textAlign: 'center', // Center the title
  },
  container: {
    height: windowHeight,
    padding: 20,
    marginTop: 70,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  profileImageContainer: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: '#808080',
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: '#808080',
    alignItems: 'center',
    justifyContent: 'center',
  },
  descriptionContainer: {
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#808080',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    marginTop: 20,
  },
  nameContainer: {
    marginVertical: 20,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: '#808080',
    borderRadius: 8,
    padding: 12,
    minHeight: 40,
  },
  ratingContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  logoutButton: {
    marginTop: 10,
    backgroundColor: '#f44336', // Red color for logout
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 200,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
});
