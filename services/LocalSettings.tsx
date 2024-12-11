import AsyncStorage from '@react-native-async-storage/async-storage';
import { Settings } from '@/types/Settings';

class LocalSettings {
  private static instance: LocalSettings;
  private storageKey = 'localSettings';

  private constructor() {}

  public static getInstance(): LocalSettings {
    if (!LocalSettings.instance) {
      LocalSettings.instance = new LocalSettings();
    }
    return LocalSettings.instance;
  }

  async saveSettings(settings: Settings): Promise<void> {
    try {
      const jsonValue = JSON.stringify(settings);
      await AsyncStorage.setItem(this.storageKey, jsonValue);
    } catch (e) {
      console.error('Failed to save user data', e);
    }
  }

  async getSettings(): Promise<Settings | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(this.storageKey);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error('Failed to fetch user data', e);
      return null;
    }
  }

  async clearSettings(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.storageKey);
    } catch (e) {
      console.error('Failed to clear user data', e);
    }
  }
}

export default LocalSettings;
