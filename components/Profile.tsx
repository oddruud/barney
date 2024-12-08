import React, { useEffect, useRef, useState } from 'react';
import { View, Modal, TouchableOpacity, TextInput, Animated, StyleSheet, Dimensions } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/Button';
import StarRating from '@/components/StarRating';
import ProfileImage from '@/components/ProfileImage';
import * as ImagePicker from 'expo-image-picker';
import ImageManipulator from 'expo-image-manipulator';
import { UserDetails } from '../types/UserDetails';
import { authentication } from '@/services/authentication/Authentication';
import LocalUserData from '@/services/LocalUserData';
import { router } from 'expo-router';
import { useData } from '@/contexts/DataContext';
import { useUser } from '@/contexts/UserContext';

interface ProfileProps {
  firstLogin: boolean;
}

const Profile: React.FC<ProfileProps> = ({
  firstLogin,
}) => {
    const [bio, setBio] = useState('');
    const [name, setName] = useState('');
    const [warning, setWarning] = useState('');
    const { user, setUser } = useUser();
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [newProfileImage, setNewProfileImage] = useState<string | null>(null);
    const scaleValue = useRef(new Animated.Value(1)).current;
    const buttonPosition = useRef(new Animated.Value(100)).current;
    const { dataProxy } = useData();
    const [isModalVisible, setIsModalVisible] = useState(false);

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
            toValue: 1.1,
            friction: 2,
            useNativeDriver: true,
          }).start(() => {
            Animated.spring(scaleValue, {
              toValue: 1,
              friction: 2,
              useNativeDriver: true,
            }).start();
          });
        }
      }, [profileImage]);
    
      useEffect(() => {
        Animated.timing(buttonPosition, {
          toValue: 0,
          duration: 500,
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

    setProfileImage(result.assets?.[0]?.uri ?? null);

    const uri = result.assets?.[0]?.uri;
    const width = result.assets?.[0]?.width ?? 0;
    const height = result.assets?.[0]?.height ?? 0;

    if (!uri) return;

    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: width / 4, height: height / 4 } }],
      { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
    );

    const resizedUri = manipResult.uri;

    if (!result.canceled) {
      setNewProfileImage(resizedUri);
      setProfileImage(resizedUri);
      await updateUserProfile(resizedUri);
      setNewProfileImage(null);
    }
  };

  const updateUserProfile = async (newProfileImage: string | null) => {
    let updatedDetails: UserDetails = user;
    updatedDetails.fullName = name;
    updatedDetails.bio = bio ?? '';
    updatedDetails.profileImage = newProfileImage ?? '';
    setUser(updatedDetails);

    if (newProfileImage) {
      updatedDetails.profileImage = await dataProxy.uploadImage(newProfileImage);
    } else {
      console.warn("no new profile image to upload");
    }

    await dataProxy.updateUserProfile(updatedDetails).then(() => {
     
    });
  };


  const handleContinue = async () => {
    if (bio.length > 0 && name.length > 0) {
      handleSave();
    } else {
      console.warn("bio or name is empty");
      setWarning("Please enter your name and bio");
    }
  };

  const handleSave = async () => {
    setIsModalVisible(true);

    if (!firstLogin) {
      updateUserProfile(profileImage);
    } else {
      updateUserProfile(profileImage);
      router.replace("/(tabs)");
    }

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
            <ProfileImage uri={profileImage} style={styles.profileImage} />
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

        {warning.length > 0 && (
          <ThemedView style={styles.warningContainer}>
            <ThemedText style={styles.warning}>{warning}</ThemedText>
          </ThemedView>
        )}

        {user.numberOfRatings > 0 && (
          <ThemedView style={styles.ratingContainer}>
            <ThemedText style={styles.label}>Rating</ThemedText>
            <StarRating count={parseInt(user.rating.toFixed(1))} userCount={user.numberOfRatings} size={30} color="#FFD700" />
          </ThemedView>
        )}

        <View style={{ flex: 1 }} />

        <Animated.View style={[styles.buttonContainer, { transform: [{ translateY: buttonPosition }] }]}>
          {firstLogin ? (
            <Button
              title="Continue"
              onPress={handleContinue} // or another function if needed
              style={styles.saveButton}
            />
          ) : (
            <>
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
            </>
          )}
        </Animated.View>
      </ThemedView>
    </ThemedView>
  );
};

export default Profile;

const windowHeight = Dimensions.get('window').height;

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
    warningContainer: {
      marginVertical: 20,
      alignItems: 'center',
      backgroundColor: '#e9eae4',
    },
    warning: {
      color: '#f44336',
    },
  });
  