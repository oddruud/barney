import React, { useState, useEffect, useRef } from 'react';
import { Animated,StyleSheet, StyleProp, ImageStyle, View, Image, Text } from 'react-native';
import { localCache } from '@/services/LocalCache';
import { UserDetails } from '@/types/UserDetails';


//expecting a width and height in pixels.

interface ProfileImageProps {
  user: UserDetails;
  showVerifiedMark?: boolean;
  profileImageOverride?: string;
  animation?: boolean;
  style?: StyleProp<ImageStyle>;
}

interface VerifyMarkDimensions {
  width: number;
  height: number;
  marginTop: number;
  marginLeft: number;
}

const ProfileImage: React.FC<ProfileImageProps> = ({ user, style, showVerifiedMark = true, profileImageOverride, animation = true }) => {
  if (!user) {
    return <View />;
  }

  const [imageLoaded, setImageLoaded] = useState(false);
  const imageOpacity = useRef(new Animated.Value(animation ? 0 : 1)).current;
  const imageScale = useRef(new Animated.Value(animation ? 0.8 : 1)).current;
  const [profileImageUrl, setProfileImageUrl] = useState(profileImageOverride || user.profileImage);
  const [verified, setVerified] = useState(user.isVerified);
  const [verifyMarkDimensions, setVerifyMarkDimensions] = useState<VerifyMarkDimensions>({width: 30, height: 30, marginTop: -30, marginLeft: 50});
  const verifiedOpacity = useRef(new Animated.Value(animation ? 0 : 1)).current;
  const verifiedScale = useRef(new Animated.Value(animation ? 0.8 : 1)).current;

  useEffect(() => {
    setVerified(user.isVerified);
  }, [user.isVerified, user.profileImage]);

  useEffect(() => {
    let markDimensions : VerifyMarkDimensions = {width: 30, height: 30, marginTop: -30, marginLeft: 50};
    
    if (style) {
      const flatStyle = StyleSheet.flatten(style);
      let imageWidth = (flatStyle.width as number) || 30;
      let imageHeight = (flatStyle.height as number) || 30;

      markDimensions.width = imageWidth * 0.4;
      markDimensions.height = imageHeight * 0.4;
      markDimensions.marginTop = imageHeight * -0.45;
      markDimensions.marginLeft = imageWidth * 0.6;
    }
    setVerifyMarkDimensions(markDimensions);
  }, [style]);

  useEffect(() => {
    if (user.profileImage && user.profileImage !== '') {
      localCache.getCachedFile(user.profileImage).then((url) => {
        if (url) {
          setProfileImageUrl(profileImageOverride || url);
        } else {
          setProfileImageUrl(profileImageOverride || user.profileImage);
        }
      });
    } else {
      setProfileImageUrl('');
    }

    setImageLoaded(false);
  }, [user,user.profileImage]);

  useEffect(() => {
    if (imageLoaded && animation) {
      Animated.parallel([
        Animated.timing(imageOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(imageScale, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start(() => {
        Animated.parallel([
          Animated.timing(verifiedOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(verifiedScale, {
            toValue: 1,
            friction: 5,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  }, [imageLoaded]);

  return (
    <View>
      <Animated.Image
        source={profileImageUrl ? { uri: profileImageUrl } : require('@/assets/images/profile_placeholder.png')}
        style={[style, { opacity: imageOpacity, transform: [{ scale: imageScale }] }]}
        onLoad={() => setImageLoaded(true)}
      />
      {verified && showVerifiedMark && (
        <Animated.Image 
          source={require('@/assets/images/verified.png')} 
          style={[
            {
              width: verifyMarkDimensions.width, 
              height: verifyMarkDimensions.height, 
              zIndex: 1000,
              marginTop: verifyMarkDimensions.marginTop, 
              marginLeft: verifyMarkDimensions.marginLeft,
              opacity: verifiedOpacity,
              transform: [{ scale: verifiedScale }]
            }
          ]} 
        />
      )}
    </View>
  );
};



export default ProfileImage;
