import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions, Image, TextInput, Text, TouchableOpacity} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Button } from '@/components/Button';
import { router } from 'expo-router';
import { useUser } from '@/contexts/UserContext';
import { authentication } from '@/data/authentication/Authentication';
import { getAuth, onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useEnvironment } from '@/contexts/EnvironmentContext';
import { useData } from '@/contexts/DataContext';
import * as Linking from 'expo-linking';
import { FirebaseError } from 'firebase/app';
import { UserDetails } from '@/types/UserDetails';


function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export default function LoginScreen() {
    const { setUser } = useUser();
    const { dataProxy } = useData();
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [email, setEmail] = useState('yelp@yolo.com');
    const [password, setPassword] = useState('testtest');
    const [errorMessage, setErrorMessage] = useState('');
    const [showLoginForm, setShowLoginForm] = useState(false);

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
        const auth = getAuth();

        //todo make this a hook
        onAuthStateChanged(auth, (user) => {
          if (user) {
            console.log("user signed in", user.uid);
            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/auth.user
            loadUserDetails(user.uid).then((userData) => {
                if (userData?.bio === null || userData?.bio === '') {
                    router.replace("/first-login-profile");
                } else {
                    router.replace("/(tabs)");
                }
            });
          }
          

        });
    }, []);

    const handleSignUpPress = async () => {

       await authentication.signUpWithEmailAndPassword(email, password).then((user) => {
        if (user) {
            const email = user.email ?? '';
            dataProxy.registerUser(user.uid, email).then(() => {
                setErrorMessage('User registered successfully');
            }).catch((error) => {
                console.error("Error registering user", error);
            });
        }
    }).catch((error) => {
        setErrorMessage(parseError(error));
    });
    }

    const handleLoginPress = async () => {
        setErrorMessage('');
        authentication.loginWithEmailAndPassword(email, password).then((user) => {
            if (user) {
                loadUserDetails(user.uid).then(() => {
                    router.replace("/(tabs)");
                });
            }
        }).catch((error) => {
            setErrorMessage(parseError(error));
        });
    }

    const parseError = (error: FirebaseError): string => {
        if (error.code === 'auth/invalid-email') {
            return 'Invalid email address';
        }
        if (error.code === 'auth/wrong-password') {
            return 'Wrong password';
        }

        if (error.code === 'auth/missing-password') {
            return 'Please enter a password';
        }

        if (error.code === 'auth/user-not-found') {
            return 'User not found';
        }
        if (error.code === 'auth/email-already-in-use') {
            return 'Email already in use';
        }
        if (error.code === 'auth/weak-password') {
            return 'Weak password';
        }
        if (error.code === 'auth/invalid-credential') {
            return 'username and/or password incorrect';
        }

        return error.code;
    }


    const loadUserDetails = async (uid: string): Promise<UserDetails | null> => {
       const userData = await dataProxy.getUserDetailsById(uid).then((userData) => {
            console.log("user data loaded for user", uid, userData?.fullName);
            if (userData) {
                setUser(userData); //todo autio save userdata
                return userData;
            }
            }).catch((error) => {
                console.error("Error fetching user data:", error);
            });

        return userData ?? null;
    }

    const screenWidth = Dimensions.get('window').width;
    const scaledFontSize = screenWidth * 0.1; // Adjust the multiplier as needed

    const handleGoogleSignInPress = async () => {
        console.log("google sign in press");
    };

    const url = Linking.useURL();
    if (url) {
        const { hostname, path, queryParams } = Linking.parse(url);
    
        console.log(
          `Linked to app with hostname: ${hostname}, path: ${path} and data: ${JSON.stringify(
            queryParams
          )}`
        );
      }

    useEffect(() => {
        const handleDeepLink = (event: { url: string }) => {
            const url = event.url;
            console.log("Received deep link:", url);

            if (url) {
                const { hostname, path, queryParams } = Linking.parse(url);
                console.log(
                  `Linked to app with hostname: ${hostname}, path: ${path} and data: ${JSON.stringify(
                    queryParams
                  )}`
                );
            }
        };

        // Add event listener
        const subscription = Linking.addEventListener('url', handleDeepLink);

        // Clean up the event listener
        return () => {
            subscription.remove();
        };
    }, []);

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
                    {!showLoginForm ? (
                        <>
                    <TouchableOpacity onPress={handleGoogleSignInPress}>
                              <Image
                                  source={require('../assets/images/signin.png')} // Replace with your image path
                                  style={styles.googleSignInImage} // Add a style for the image
                              />
                          </TouchableOpacity>
                        <Button
                            style={styles.openButton}
                            title="email login"
                            onPress={() => setShowLoginForm(true)}
                        />
                        </>
                    ) : (
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
                        </View>
                    )}
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
    openButton: {
        alignSelf: 'center',
        backgroundColor: '#000000',
        padding: 10,
        borderRadius: 10,
        marginHorizontal: 10,
    },
    loginButtonContainer: {
      position: 'absolute',
      bottom: 40,
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
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
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
        textAlign: 'center',
        backgroundColor: 'black',
        padding: 10,
        borderRadius: 5,
    },
    googleSignInImage: {
        width: 175, // Set your desired width
        height: 40, // Set your desired height
        marginBottom: 20, // Optional: adjust spacing
    },
});
