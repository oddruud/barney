
import Profile from '@/components/Profile';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  return (
    <Profile
      firstLogin={false}
      onPickImage={async () => {
        console.log("picking image externally");
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });
          }}
    />
  );
}