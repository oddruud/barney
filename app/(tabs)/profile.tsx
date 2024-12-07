import { StyleSheet, Image, Platform, Switch, TouchableOpacity, TextInput, Dimensions, Modal, View, ActivityIndicator, Animated } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useEffect, useRef } from 'react';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useState } from 'react';
import { Button } from '@/components/Button';
import StarRating from '@/components/StarRating';
import { useData } from '@/contexts/DataContext';
import LocalUserData from '@/data/LocalData';
import { useUser } from '@/contexts/UserContext';
import { router } from 'expo-router';
import { authentication } from '@/data/authentication/Authentication';
import { UserDetails } from '@/types/UserDetails';

const windowHeight = Dimensions.get('window').height;


export default function ProfileScreen() {
  const { user, setUser } = useUser();
  const { dataProxy } = useData();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [newProfileImage, setNewProfileImage] = useState<string | null>(null);
  const [bio, setBio] = useState('');
  const [name, setName] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const scaleValue = useRef(new Animated.Value(1)).current;
  const buttonPosition = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    
    if (user) {
      setName(user.fullName);
      setBio(user.bio);
      setProfileImage(user.profileImage);
    }
  }, [user]);

  useEffect(() => {
    if (profileImage) {
      Animated.spring(scaleValue, {
        toValue: 1.1, // Scale up slightly
        friction: 2,  // Adjust the spring effect
        useNativeDriver: true,
      }).start(() => {
        Animated.spring(scaleValue, {
          toValue: 1, // Scale back to original
          friction: 2,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [profileImage]);

  useEffect(() => {
    Animated.timing(buttonPosition, {
      toValue: 0, // Move to original position
      duration: 500, // Animation duration
      useNativeDriver: true,
    }).start();
  }, []);


  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    console.log("picked image", result.assets?.[0]?.uri);

    setProfileImage(result.assets?.[0]?.uri ?? null);

    const uri = result.assets?.[0]?.uri;
    const width = result.assets?.[0]?.width ?? 0;
    const height = result.assets?.[0]?.height??0;

    if (!uri) return;

    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: width / 4, height: height / 4 } }],
      { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
    );
    
    const resizedUri = manipResult.uri;
    console.log("resizedUri", resizedUri);

    if (!result.canceled) {
      setNewProfileImage(resizedUri);
      console.log("setting profile image", newProfileImage);
      setProfileImage(resizedUri);
      await updateUserProfile(resizedUri);
    } else {
      console.log("image picker canceled");
    }
  };


  const updateUserProfile = async (newProfileImage: string | null) => {
    console.log("updating user profile", name, bio, newProfileImage);

    let updatedDetails : UserDetails = user;
    updatedDetails.fullName = name;
    updatedDetails.bio = bio ?? '';

    if (newProfileImage) {
      console.log("uploading image", newProfileImage);
      updatedDetails.profileImage = await dataProxy.uploadImage(newProfileImage);
    } else {
      console.warn("no new profile image to upload");
    }
    
    dataProxy.updateUserProfile(updatedDetails).then(() => {
      console.log("updated user in firestore", user);
    });

    setUser(updatedDetails);
  }

  const handleSave = async () => {

    setIsModalVisible(true);

    console.log("updating user!", user?.id, name, bio, profileImage);

    await updateUserProfile();
    
    setTimeout(() => {
      setIsModalVisible(false);
    }, 1000);
  };

  const handleLogout = async () => {
    await authentication.logout().then(() => {
      LocalUserData.getInstance().clearUserData();
      router.replace("/login");
    }).catch((error) => {
      console.error("Error logging out", error);
    });
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
          <Animated.Image 
            source={{ uri: profileImage }} 
            style={[styles.profileImage, { transform: [{ scale: scaleValue }] }]} 
          />
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
        <ThemedText style={styles.label}>Bio</ThemedText>
        <TextInput
          style={styles.descriptionInput}
          multiline
          placeholder="Tell us about yourself..."
          value={bio}
          onChangeText={setBio}
          placeholderTextColor="#808080"
        />
      </ThemedView>

      {user.numberOfRatings > 0 && (
      <ThemedView style={styles.ratingContainer}>
        <ThemedText style={styles.label}>Rating</ThemedText>
        <StarRating count={parseInt(user.rating.toFixed(1))} userCount={user.numberOfRatings} size={30} color="#FFD700"  />
      </ThemedView>
      )}

      <View style={{ flex: 1 }} />

      <Animated.View style={[styles.buttonContainer, { transform: [{ translateY: buttonPosition }] }]}>
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
      </Animated.View>
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
    backgroundColor: '#e9eae4',
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
    backgroundColor: '#e9eae4',
  },
  descriptionInput: {
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
    borderRadius: 8,
    padding: 12,
    minHeight: 40,
  },
  ratingContainer: {
    marginVertical: 20,
    alignItems: 'center',
    backgroundColor: '#e9eae4',
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
  buttonContainer: {
    marginBottom: 180,
  },
});
