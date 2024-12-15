import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions, Image, TextInput, Text, TouchableOpacity,KeyboardAvoidingView,Keyboard, Platform, TouchableWithoutFeedback,} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Button } from '@/components/Button';
import { router } from 'expo-router';
import { useUser } from '@/contexts/UserContext';
import { authentication } from '@/services/authentication/Authentication';
import { getAuth, onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, sendEmailVerification } from "firebase/auth";
import { useData } from '@/contexts/DataContext';
import * as Linking from 'expo-linking';
import { UserDetails } from '@/types/UserDetails';
import { Environment, useEnvironment } from '@/contexts/EnvironmentContext';
import { useGlobalEventsEmitter, GlobalEventEnum } from '@/contexts/GlobalEventsContext';
import { parseFirebaseError } from '@/utils/firebaseErrorParsingUtil';


function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export interface Message {
    message: string;
    type: 'error' | 'success';
}


export default function LoginScreen() {
    const { setUser } = useUser();
    const { dataProxy } = useData();
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState<Message | null>(null);
    const [showLoginForm, setShowLoginForm] = useState(false);
    const { environment } = useEnvironment();
    const globalEventsEmitter = useGlobalEventsEmitter();
    const [isRegistering, setIsRegistering] = useState(false);
    const [videoSource, setVideoSource] = useState('');   
    const fadeAnim = useRef(new Animated.Value(0)).current; // Initial opacity value of 0
    const buttonFadeAnim = useRef(new Animated.Value(0)).current; // Initial opacity value for button
    const [forgotPasswordMode, setForgotPasswordMode] = useState(false);

    useEffect(() => {
        dataProxy.getRandomFrontPageVideo().then((videoUrl) => {
            console.log("video url", videoUrl);
            setVideoSource(videoUrl);
        });
    }, []);

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

    const handleVideoLoaded = () => {
        console.log("video loaded emitting event");
        globalEventsEmitter.emit(GlobalEventEnum.VIDEO_LOADED);
    }

    const loginUser = async (user: User) => {
        console.log("user signed in", user.uid);
        loadUserDetails(user.uid).then((userData) => {
            if (userData?.bio === null || userData?.bio === '') {
                router.replace("/first-login-profile");
            } else {
                router.replace("/(tabs)");
            }
        });
    }
    const handleResetPasswordPress = async () => {
        console.log("password reset");
        await authentication.resetPassword(email);
        setMessage({ message: 'Password reset email sent', type: 'success' });
        setForgotPasswordMode(false);
    };

    const cancelForgotPasswordPress = () => {
        console.log("Cancel Forgot Password pressed");
        setForgotPasswordMode(false);


    }

    const loginOrVerifyEmail = async (user: User) => {
        if (environment === Environment.Development) {
            console.log("environment is development, log in immediately");
            console.log("user signed in", user.uid);
            loginUser(user);
        } else {
            console.log("environment is production or staging, verify email");
            if (user.emailVerified) {
                loginUser(user);
            } else {
                sendEmailVerification(user).then(() => {
                    console.log("email verification sent");
                    setMessage({ message: 'Please verify your email', type: 'success' });
                });
            }
        }
    }

    useEffect(() => {
        console.log("environment is ", environment);

        const auth = getAuth();

        const currentUser = auth.currentUser;

        console.log("current user", currentUser);

        if (currentUser) {
            loginOrVerifyEmail(currentUser);
        } else {
            console.log("no user signed in");
        }
    }, []);

    const handleSignUpPress = async () => {

       await authentication.signUpWithEmailAndPassword(email, password).then((user) => {
        if (user) {
            const email = user.email ?? '';
            dataProxy.registerUser(user.uid, email).then(() => {
                loginOrVerifyEmail(user);
            }).catch((error) => {
                console.error("Error registering user", error);
            });
        }
    }).catch((error) => {
        setMessage({ message: parseFirebaseError(error), type: 'error' });
    });
    }

    const handleLoginPress = async () => {
        setMessage(null);
        authentication.loginWithEmailAndPassword(email, password).then((user) => {
            if (user) {
                loginUser(user);
            }
        }).catch((error) => {
            setMessage({ message: parseFirebaseError(error), type: 'error' });
        });
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

    const isGoogleSignInEnabled = false;

    const handleForgotPasswordPress = () => {
        console.log("Forgot Password pressed");
        setForgotPasswordMode(true);
        // Implement password reset logic here
    };

    return (
        <>
        <View style={styles.container}>
            {videoSource && (
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
                    onLoad={handleVideoLoaded}
                />
            )}

            {isLoggingIn && (
                <Image
                    source={require('../assets/images/loading.gif')}
                    style={styles.loadingImage}
                />
            )}
            {!isLoggingIn && (
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }
                }>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                  <>  
            <Animated.Text style={[styles.title, { opacity: fadeAnim, fontSize: scaledFontSize }]}>
            </Animated.Text>
                <Animated.View style={[styles.loginButtonContainer, { opacity: buttonFadeAnim }]}>
                    {!showLoginForm ? (
                        <>
                    {isGoogleSignInEnabled && (
                        <View></View>
                        )}
                        <Button
                            style={styles.openButton}
                            title="Let's Walk"
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
                            {!forgotPasswordMode && (
                                <>
                                <Text style={styles.label}>Password</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                />
                                </>
                            )}
                            {message ? (
                                <Text style={{...styles.messageText, color: message.type === 'error' ? 'red' : 'green'}}>{message.message}</Text>
                            ) : null}
                            <View>
                                {isRegistering ? (
                                    <Button style={styles.loginButton}
                                        title="Register" 
                                        onPress={handleSignUpPress} 
                                    />
                                ) : (
                                    <>
                                {!forgotPasswordMode && (
                                    <>
                                    <Button style={styles.loginButton}
                                        title="Login" 
                                        onPress={handleLoginPress} 
                                    />
                                    
                                    <Button
                                    style={styles.forgotPasswordButton}
                                    textStyle={styles.forgotPasswordButtonText}
                                    title="Forgot Password?"
                                    onPress={handleForgotPasswordPress}
                                />
                                </>
                                )}
                                {forgotPasswordMode && (
                                    <>
                                    <Button
                                        style={[styles.loginButton, {width: 160}]}

                                        title="Reset Password"
                                        onPress={handleResetPasswordPress}
                                    />
                                        <Button
                                        style={[styles.loginRegisterSwitchButton, {width: 160}]}
                                        textStyle={styles.loginRegisterSwitchButtonText}
                                        title="Back"
                                        onPress={cancelForgotPasswordPress}
                                    />
                                    </>
                                )}
                                </>
                                )}
                            </View>

                            {!forgotPasswordMode && (
                                <Button style={styles.loginRegisterSwitchButton} textStyle={styles.loginRegisterSwitchButtonText}
                                    title={isRegistering ? "Login" : "Register"} 
                                    onPress={() => {
                                        setMessage(null);
                                        setIsRegistering(!isRegistering)
                                    }} 
                                />
                            )}
                       
                        
                        </View>
                        
                    )}
                </Animated.View>
                </>
                </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            )}
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
        width: 175, // Set your desired width
        height: 40, // Set your desired height
        marginBottom: 20, // Optional: adjust spacing
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
});
