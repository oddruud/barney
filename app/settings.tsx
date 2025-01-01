import { Link, Stack, useRouter } from 'expo-router';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import {Button} from '@/components/Button';
import { authentication } from '@/services/authentication/Authentication';
import { ThemedView } from '@/components/ThemedView';
import { useSettings } from '@/contexts/SettingsContext';
import { IconSymbol } from '@/components/ui/IconSymbol';
import {useUser} from '@/contexts/UserContext';
import LocalUserData from '@/controllers/LocalUserData';
import {DataProxySingleton} from '@/services/DataProxy';
import { useState } from 'react';
import AreYouSureModal from '@/components/modals/AreYouSureModal';
import { DeviceType, getDeviceType } from '@/utils/deviceUtils';

const deviceType = getDeviceType();
  
export default function SettingsScreen() {
  const router = useRouter();
  const { settings, setSettings } = useSettings();
  const {user} = useUser();
  const dataProxy = DataProxySingleton.getInstance(false);
  const [isModalVisible, setModalVisible] = useState(false);

  const handleDeleteAccount = () => {
    setModalVisible(true);
  };

  const confirmDeleteAccount = () => {
    if (user.id) {
      dataProxy.deleteUser(user.id).then(() => {
        authentication.deleteAccount().then(() => {
          LocalUserData.getInstance().clearUserData();
          router.navigate('/login');
        });
      });
    }
    setModalVisible(false);
  };

  const cancelDeleteAccount = () => {
    setModalVisible(false);
  };

  return (
    <>
      <ThemedView style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 30 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <IconSymbol 
              name="chevron.left" 
              size={24} 
              color="#00796b" 
              style={{ opacity: 1 }}
            />
            <Text style={{ color: '#00796b', fontSize: 16 }}>Back</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <Text>Search Radius: {settings.searchRadius} km</Text>
        <Slider
          style={{ width: 200, height: 40 }}
          minimumValue={1}
          maximumValue={100}
          step={1}
          value={settings.searchRadius}
          onValueChange={(value) => setSettings({ ...settings, searchRadius: value })}
        />
        <View style={{ flex: 1 }} />
        <Button
          title="Delete Account"
          onPress={handleDeleteAccount}
          style={styles.deleteButton}
        />
      </ThemedView>
      <AreYouSureModal
        visible={isModalVisible}
        title="Are you sure you want to delete your account?"
        onConfirm={confirmDeleteAccount}
        onCancel={cancelDeleteAccount}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 40,
    justifyContent: 'space-between',
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 20,
  },
  deleteButton: {
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: '#d32f2f', // Darker red color for delete account
    width: deviceType === DeviceType.Phone ? 160 : 200,
    alignSelf: 'center',
  },
});