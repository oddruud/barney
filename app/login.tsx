import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions, TextInput, Text, KeyboardAvoidingView, Keyboard, Platform, TouchableWithoutFeedback } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Button } from '@/components/Button';
import { router } from 'expo-router';
import { useUser } from '@/contexts/UserContext';
import { authentication } from '@/services/authentication/Authentication';
import { User, sendEmailVerification } from "firebase/auth";
import { useData } from '@/contexts/DataContext';
import { UserDetails } from '@/types/UserDetails';
import { Environment, useEnvironment } from '@/contexts/EnvironmentContext';
import { useGlobalEventsEmitter, GlobalEventEnum } from '@/contexts/GlobalEventsContext';
import { parseFirebaseError } from '@/utils/firebaseErrorParsingUtil';
import { getAuth } from "firebase/auth";
import * as Linking from 'expo-linking';
import { LoginForm, AuthState, Message, AuthAction } from '@/components/LoginForm';

export default function LoginScreen() {
  const { setUser } = useUser();
  const { dataProxy } = useData();
  const { environment } = useEnvironment();
  const globalEventsEmitter = useGlobalEventsEmitter();

  const [authState, setAuthState] = useState<AuthState>({
    email: '',
    password: '',
    isRegistering: false,
    forgotPasswordMode: false,
    showLoginForm: false,
    isLoggingIn: false
  });
  
  const [message, setMessage] = useState<Message | null>(null);
  const [videoSource, setVideoSource] = useState('');
  
  const buttonFadeAnim = useRef(new Animated.Value(0)).current;
  
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    initializeScreen();
    setupAuthStateListener();
    return setupDeepLinkListener();
  }, []);

  const initializeScreen = async () => {
    const videoUrl = await dataProxy.getRandomFrontPageVideo();
    setVideoSource(videoUrl);
    startAnimations();
  };

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(buttonFadeAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ]).start();
  };

  const handleVideoLoaded = () => {
    setTimeout(() => {
      globalEventsEmitter.emit(GlobalEventEnum.VIDEO_LOADED);
    }, 100);
  };


  const handleAuth = async (action: AuthAction) => {
    setMessage(null);
    const { email, password } = authState;

    try {
      switch (action) {
        case AuthAction.LOGIN:
          const user = await authentication.loginWithEmailAndPassword(email, password);
          if (user) await loginUser(user);
          break;
        case AuthAction.REGISTER:
          const newUser = await authentication.signUpWithEmailAndPassword(email, password);
          if (newUser) {
            await dataProxy.registerUser(newUser.uid, newUser.email ?? '');
            await loginOrVerifyEmail(newUser);
          }
          break;
        case AuthAction.RESET:
          await authentication.resetPassword(email);
          setMessage({ message: 'Password reset email sent', type: 'success' });
          setAuthState(prev => ({ ...prev, forgotPasswordMode: false }));
          break;
      }
    } catch (error) {
      setMessage({ message: parseFirebaseError(error), type: 'error' });
    }
  };

  const loginUser = async (user: User) => {
    const userData = await loadUserDetails(user.uid);
    if (!userData?.bio) {
      router.replace("/first-login-profile");
    } else {
      router.replace("/(tabs)");
    }
  };

  const loginOrVerifyEmail = async (user: User) => {
    if (environment === Environment.Development) {
      await loginUser(user);
    } else if (!user.emailVerified) {
      await sendEmailVerification(user);
      setMessage({ message: 'Please verify your email', type: 'success' });
    } else {
      await loginUser(user);
    }
  };

  const loadUserDetails = async (uid: string): Promise<UserDetails | null> => {
    try {
      let userData = await dataProxy.getUserDetailsById(uid);
      const auth = getAuth();
      console.log('Auth', auth.currentUser);
    
      if (userData) {
        console.log('current user uid', auth.currentUser?.uid);
        userData.id = auth.currentUser?.uid ?? '';
        console.log('User', userData);
        setUser(userData);
      }else{
        console.log('User data not found');
        console.log('Registering user ', uid, auth.currentUser?.email);
        userData = await dataProxy.registerUser(uid, auth.currentUser?.email ?? '');
        
        if (userData) {
          console.log('Setting user');
          setUser(userData);
        } else {
          console.log('User not registered...');
        }
 
      }

   
      return userData;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  const setupAuthStateListener = () => {
    const auth = getAuth();
    return auth.onAuthStateChanged((user) => {
      if (user) {
        globalEventsEmitter.emit(GlobalEventEnum.USER_SIGNED_IN);
        loginOrVerifyEmail(user);
      }
    });
  };

  const setupDeepLinkListener = () => {
    const subscription = Linking.addEventListener('url', (event) => {
      const { url } = event;
      if (url) {
        const { hostname, path, queryParams } = Linking.parse(url);
        console.log(
          `Linked to app with hostname: ${hostname}, path: ${path} and data: ${JSON.stringify(
            queryParams
          )}`
        );
      }
    });

    return () => subscription.remove();
  };

  return (
    <View style={styles.container}>
      {videoSource && (
        <Video
          source={{ uri: videoSource }}
          rate={1.0}
          volume={1.0}
          isMuted={false}
          resizeMode={ResizeMode.COVER}
          shouldPlay={true}
          isLooping={true}
          style={styles.video}
          onLoad={handleVideoLoaded}
        />
      )}
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.contentContainer}>            
            <LoginForm 
              authState={authState}
              setAuthState={setAuthState}
              message={message}
              handleAuth={handleAuth}
              buttonFadeAnim={buttonFadeAnim}
            />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  loginButton: {
    alignSelf: 'center',
    bottom: 10,
    opacity: 0.7,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 10,
    borderRadius: 10,
    width: 120,
    marginHorizontal: 10,
    marginTop: 20,
  },
  openButton: {
    alignSelf: 'center',
    bottom: 10,
    opacity: 0.7,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 10,
    borderRadius: 10,
    width: 120,
    marginHorizontal: 10,
    marginTop: 50,
  },
  loginButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    marginTop: 420,
  },
  title: {
    alignSelf: 'center',
    fontFamily: 'Voltaire-Frangela',
    fontSize: 42,
    color: 'white',
    marginBottom: 20,
    position: 'absolute',
    top: 140,
  },
  loadingImage: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    width: 40,
    height: 40,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    bottom: -30,
  },
  inputContainer: {
    marginBottom: 30,
    width: '80%',
  },
  label: {
    color: 'white',
    marginBottom: 5,
  },
  input: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: 200,
  },
  messageText: {
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 1)',
    padding: 10,
    borderRadius: 5,
  },
  googleSignInImage: {
    width: 175,
    height: 40,
    marginBottom: 20,
  },
  loginRegisterSwitchButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.0)',
    padding: 10,
    borderRadius: 10,
    marginTop: 30,
    alignSelf: 'center',
  },
  loginRegisterSwitchButtonText: {
    color: 'white',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  otherAuthenticationMethodButton: {
    opacity: 0.7,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 10,
    borderRadius: 10,
    width: 80,
    marginHorizontal: 10,
    position: 'absolute',
    alignSelf: 'center',
    bottom: 40,
  },
  otherAuthenticationMethodButtonText: {
    color: 'white',
    fontSize: 16,
  },
  forgotPasswordButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.0)',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    alignSelf: 'center',
  },
  forgotPasswordButtonText: {
    color: 'white',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  resetPasswordButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.0)',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    alignSelf: 'center',
  },
  resetPasswordButtonText: {
    color: 'white',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
