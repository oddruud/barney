import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Image, Platform, Switch, TouchableOpacity, TextInput, Dimensions, Modal, View, ActivityIndicator, Animated } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/Button';
import StarRating from '@/components/StarRating';
import { useData } from '@/contexts/DataContext';
import LocalUserData from '@/data/LocalData';
import { useUser } from '@/contexts/UserContext';
import { router } from 'expo-router';
import { authentication } from '@/data/authentication/Authentication';
import { UserDetails } from '@/types/UserDetails';

const windowHeight = Dimensions.get('window').height;

export default function ProfileView() {
  const { user, setUser } = useUser();
  const { dataProxy } = useData();
  const [profileImage, setProfileImage] = useState<string | null>(null);
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

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    setIsModalVisible(true);

    console.log("updating user!", user?.id, name, bio, profileImage);

    let updatedDetails: UserDetails = user;
    updatedDetails.fullName = name;
    updatedDetails.bio = bio ?? '';
    updatedDetails.profileImage = profileImage ?? '';

    dataProxy.updateUserProfile(user).then(() => {
      console.log("updated user in firestore", user);
    });

    setUser(updatedDetails);

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
            <StarRating count={parseInt(user.rating.toFixed(1))} userCount={user.numberOfRatings} size={30} color="#FFD700" />
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
  // ... existing styles ...
});
