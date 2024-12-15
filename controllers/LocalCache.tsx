import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getRandomId} from '@/utils/IDUtils';


class LocalCache{
    private static instance: LocalCache;
  
    private constructor() {}
  
    public static getInstance(): LocalCache {
      if (!LocalCache.instance) {
        LocalCache.instance = new LocalCache();
      }
      return LocalCache.instance;
    }
    
    async getCachedFile(url: string): Promise<string | null> {
       const localCachedFilePath =  await this.getCacheItem(url);

       if (localCachedFilePath) {
        let info = await FileSystem.getInfoAsync(localCachedFilePath);
        
        if (!info.exists) {
            console.log('File does not exist, the local cache is corrupted, removing item from cache');
            this.removeCacheItem(url);
            this.download(url);
            return url;
        } else {
            return localCachedFilePath;
        }
       } else {
          this.download(url);
       }

       return url;
    }

    async download(url: string): Promise<string | null> {

        if (!FileSystem.cacheDirectory) {
            console.error("cache directory not found");
            return null;
        }

        // get the filename from the url
        const filename = getRandomId();
        const localFilePath = FileSystem.cacheDirectory + filename + ".jpg";

        const result = await FileSystem.downloadAsync(
            url,
            localFilePath
        );
        
        this.setCacheItem(url, localFilePath);
        return localFilePath;
    }

    async setCacheItem(key: string, value: string): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
      console.error('Failed to save cache item', e);
    }
  }

  async getCacheItem(key: string): Promise<string | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error('Failed to fetch user data', e);
      return null;
    }
  }

  async removeCacheItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }
}

const localCache = LocalCache.getInstance();

export { localCache };
