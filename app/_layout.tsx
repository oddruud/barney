import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { router } from 'expo-router';
import { UserDetails } from '@/types/UserDetails';
import { useColorScheme } from '@/hooks/useColorScheme';
import { UserProvider } from '@/contexts/UserContext';
import { EnvironmentProvider } from '@/contexts/EnvironmentContext';
import { DataProvider } from '@/contexts/DataContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { SmartServiceProvider } from '@/contexts/SmartServiceContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [user, setUser] = useState<UserDetails>();
  const [loaded] = useFonts({
    'SpaceMono': require('../assets/fonts/SpaceMono-Regular.ttf'),
    'Voltaire-Frangela': require('../assets/fonts/Voltaire-Frangela.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      router.replace("/login"); 
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <EnvironmentProvider>
        <DataProvider>
          <SmartServiceProvider>
          <UserProvider>
            <SettingsProvider>
            <Stack initialRouteName="login">
              <Stack.Screen 
          name="login" 
          options={{ 
            headerShown: false,
            title: 'Login'
          }} 
        />
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false,
            title: 'Tabs'
          }} 
        />
        <Stack.Screen 
          name="details/[id]" 
          options={{ 
            headerShown: false,
            title: 'Walk Details'
          }} 
        />
         <Stack.Screen 
          name="user-interaction/[id]" 
          options={{ 
            headerShown: false,
            title: 'User Interaction'
          }} 
        />
        <Stack.Screen 
          name="+not-found" 
          options={{ 
            title: 'Not Found'
          }} 
        />
         <Stack.Screen 
          name="first-login-profile" 
          options={{ 
            headerShown: false,
            title: 'First Login Profile'
          }} 
        />
         <Stack.Screen 
          name="settings" 
          options={{ 
            headerShown: false,
            title: 'Settings'
          }} 
        />
        
      </Stack>
          <StatusBar style="auto" />
            </SettingsProvider>
          </UserProvider>
          </SmartServiceProvider>
        </DataProvider>
      </EnvironmentProvider>
    </ThemeProvider>
  );
}
