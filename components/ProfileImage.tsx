import React, { useState, useEffect, useRef } from 'react';
import { Animated, StyleProp, ImageStyle } from 'react-native';
import { localCache } from '@/services/LocalCache';

interface ProfileImageProps {
  uri: string;
  style?: StyleProp<ImageStyle>;
}

const ProfileImage: React.FC<ProfileImageProps> = ({ uri, style }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const imageScale = useRef(new Animated.Value(0.8)).current;
  const [profileImageUrl, setProfileImageUrl] = useState(uri);

  useEffect(() => {
    if (uri && uri !== '') {
      localCache.getCachedFile(uri).then((url) => {
        if (url) {
          setProfileImageUrl(url);
        } else {
          setProfileImageUrl(uri);
        }
      });
    } else {
      setProfileImageUrl('');
    }
    setImageLoaded(false);
  }, [uri]);

  useEffect(() => {
    if (imageLoaded) {
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
      ]).start();
    }
  }, [imageLoaded]);

  return (
    <Animated.Image
      source={profileImageUrl ? { uri: profileImageUrl } : require('@/assets/images/profile_placeholder.png')}
      style={[style, { opacity: imageOpacity, transform: [{ scale: imageScale }] }]}
      onLoad={() => setImageLoaded(true)}
    />
  );
};

export default ProfileImage;
