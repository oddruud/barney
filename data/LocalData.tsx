import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserDetails } from '../types/UserDetails';

class LocalUserData {
  private static instance: LocalUserData;
  private storageKey = 'localUserData';

  private constructor() {}

  public static getInstance(): LocalUserData {
    if (!LocalUserData.instance) {
      LocalUserData.instance = new LocalUserData();
    }
    return LocalUserData.instance;
  }

  async saveUserData(userData: UserDetails): Promise<void> {
    try {
      const jsonValue = JSON.stringify(userData);
      await AsyncStorage.setItem(this.storageKey, jsonValue);
    } catch (e) {
      console.error('Failed to save user data', e);
    }
  }

  async getUserData(): Promise<UserDetails | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(this.storageKey);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error('Failed to fetch user data', e);
      return null;
    }
  }

  async clearUserData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.storageKey);
    } catch (e) {
      console.error('Failed to clear user data', e);
    }
  }
}

export default LocalUserData;
