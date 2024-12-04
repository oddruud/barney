import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions, Image, TextInput, Text } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Button } from '@/components/Button';
import { router } from 'expo-router';
import LocalUserData from '@/data/LocalData';
import { dataProxy } from '@/data/DataProxy';
import { UserDetails } from '@/types/UserDetails';
import { useUser } from '@/contexts/UserContext';
import { authentication } from '@/data/authentication/Authentication';
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { FirebaseError } from 'firebase/app';


function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export default function LoginScreen() {
    const { setUser } = useUser();
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const videoSource = 'https://roboruud.nl/walk.mp4';    
    const fadeAnim = useRef(new Animated.Value(0)).current; // Initial opacity value of 0
    const buttonFadeAnim = useRef(new Animated.Value(0)).current; // Initial opacity value for button

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1, // Fade to opacity value of 1
            duration: 10000, // Duration of the fade-in effect
            useNativeDriver: true,
        }).start();

        Animated.timing(buttonFadeAnim, {
            toValue: 1, // Fade to opacity value of 1
            duration: 2000, // Duration of the fade-in effect
            useNativeDriver: true,
        }).start();
    }, [fadeAnim, buttonFadeAnim]);


    useEffect(() => {
        console.log("errorMessage", errorMessage);
    }, [errorMessage]);

    const auth = getAuth();

    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/auth.user
        const uid = user.uid;
        console.log("user signed in", user);
        setIsLoggingIn(false);
        loadUserData(uid);

        // ...
      }else {
        setIsLoggingIn(false);
      }
    });

    const handleSignUpPress = async () => {
        const result: User | null | FirebaseError = await authentication.signUpWithEmailAndPassword(email, password);
        console.log("sign up result", result);
        
        if (result instanceof FirebaseError) {
            setErrorMessage(result.message);
        }else{
            console.log("sign up success", result);
            const user = result as User;
            await dataProxy.registerUser(user.uid ?? '', user.email ?? '');
        }
    }

    const handleLoginPress = async () => {
        setIsLoggingIn(true);
        setErrorMessage('');
        console.log("test login press");
        try {
            const result: User | null | FirebaseError = await authentication.loginWithEmailAndPassword(email, password);
            console.log("login result", result);
            
            if (result instanceof FirebaseError) {
                setErrorMessage(result.message);
            }
        } catch (error: any) {
            setErrorMessage(error.message);
            console.error("Login error:", error);
        } finally {
            setIsLoggingIn(false);
        }
    }


    const loadUserData = async (uid: string) => {
        const localUserData = LocalUserData.getInstance();
        try {
            //TODO will be removed soon
            const userData: UserDetails | null = await dataProxy.getLocalUserData(uid);
            
            if (userData) {
                localUserData.saveUserData(userData);
                setUser(userData);
                router.replace("/(tabs)");
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    }

    const screenWidth = Dimensions.get('window').width;
    const scaledFontSize = screenWidth * 0.1; // Adjust the multiplier as needed

    return (
        <>
        <View style={styles.container}>
            <Video
                source={{ uri: videoSource }}
                rate={1.0}
                volume={1.0}
                isMuted={false}
                resizeMode={ResizeMode.COVER}
                useNativeControls={false}
                shouldPlay={true}
                isLooping={true}
                style={styles.video}
            />

            

            {isLoggingIn && (
                <Image
                    source={require('../assets/images/loading.gif')}
                    style={styles.loadingImage}
                />
            )}
            {!isLoggingIn && (
                <Animated.View style={[styles.loginButtonContainer, { opacity: buttonFadeAnim }]}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>
                    {errorMessage ? (
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    ) : null}
                    <View style={styles.buttonRow}>
                        <Button style={styles.loginButton}
                            title="Login" 
                            onPress={handleLoginPress} 
                        />
                        <Button style={styles.loginButton}
                            title="Sign Up" 
                            onPress={handleSignUpPress} 
                        />
                    </View>
                </Animated.View>
            )}
            <Animated.Text style={[styles.title, { opacity: fadeAnim, fontSize: scaledFontSize }]}>
                Let's Walk
            </Animated.Text>
        </View>
        </>
    );
};

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
      backgroundColor: '#000000',
      padding: 10,
      borderRadius: 10,
      width: '40%',
      marginHorizontal: 10,
    },
    loginButtonContainer: {
      position: 'absolute',
      bottom: 40,
    },
    title: {
      position: 'absolute',
      top: 290,
      alignSelf: 'center',
      fontFamily: 'Voltaire-Frangela',
      fontSize: 42,
      color: 'white',
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
    },
    inputContainer: {
        marginBottom: 20,
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
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
        textAlign: 'center',
    },
});
