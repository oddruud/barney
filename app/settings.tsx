import { Link, Stack, useRouter } from 'expo-router';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';

import { ThemedView } from '@/components/ThemedView';
import { useSettings } from '@/contexts/SettingsContext';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, setSettings } = useSettings();

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
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 40,
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
});
