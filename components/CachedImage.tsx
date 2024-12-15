import React, { useState, useEffect, useRef } from 'react';
import {StyleProp, ImageStyle, View, Image } from 'react-native';
import { localCache } from '@/controllers/LocalCache';

interface CachedImageProps {
  url: string;
  style?: StyleProp<ImageStyle>;
}

const CachedImage: React.FC<CachedImageProps> = ({ url, style}) => {
  if (!url) {
    return <View />;
  }

  const [imageUrl, setImageUrl] = useState(url);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (url && url !== '') {
      localCache.getCachedFile(url).then((url) => {
        if (url) {
          setImageUrl(url);
        } else {
          setImageUrl('');
        }
      });
    } else {
      setImageUrl('');
    }
  }, [url]);

  return (
    <Image
      source={{ uri: imageUrl }}
      style={style}
      onLoad={() => setImageLoaded(true)}
    />
  );
};

export default CachedImage;
