import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions, Image } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Button } from '@/components/Button';
import { router } from 'expo-router';
import { Text } from '@/components/Themed';
import LocalUserData from '@/data/LocalData';
import { dataProxy } from '@/data/DataProxy';
import { UserDetails } from '@/types/UserDetails';
import { useUser } from '@/contexts/UserContext';

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export default function LoginScreen() {
    const { setUser } = useUser();
    const [isLoading, setIsLoading] = useState(false);

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

    const handleLoginPress = async () => {
        setIsLoading(true);
        await login();
        setIsLoading(false);
    };

    const checkLoggedIn = async () => {
        const userData: UserDetails | null = await LocalUserData.getInstance().getUserData();
        //todo check with server if user session is still valid
        const sessionValid = await dataProxy.checkSessionValidity(userData?.id);
        
        if (userData && sessionValid) {
            setUser(userData);
            //TODO show logging in visual
            router.replace("/(tabs)");
        }
    }

    checkLoggedIn();

    const login = async () => {
        const localUserData = LocalUserData.getInstance();
        try {
            // Introduce a delay before starting the login process
            await sleep(2000); // Sleep for 2 seconds

            //todo actual login flow
            const userData: UserDetails | null = await dataProxy.getLocalUserData();
            
            if (userData) {
                console.log("logged in user", userData);
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
            {isLoading && (
                <Image
                    source={require('../assets/images/loading.gif')}
                    style={styles.loadingImage}
                />
            )}
            {!isLoading && (
                <Animated.View style={[styles.loginButtonContainer, { opacity: buttonFadeAnim }]}>
                    <Button style={styles.loginButton}
                        title="Login" 
                        onPress={handleLoginPress} 
                    />
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
      position: 'absolute',
      alignSelf: 'center',
      bottom: 60,
      opacity: 0.7,
      backgroundColor: '#000000',
      padding: 10,
      borderRadius: 10,
      width: 200,
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
});
