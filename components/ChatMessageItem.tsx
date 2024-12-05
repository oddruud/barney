import React, { useRef, useEffect } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import { Text } from '../components/Themed';
import { ChatMessage } from '../types/ChatMessage';
import { getColorFromUsername } from '../utils/colorUtils';// Assuming styles are in a separate file



function ChatMessageItem({ message, isLocalUser }: { message: ChatMessage, isLocalUser: boolean }) {
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial opacity value
  const slideAnim = useRef(new Animated.Value(isLocalUser ? 300 : -300)).current; // Initial position value

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: message.newMessage ? 1000 : 0, // Duration of the fade-in effect
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: message.newMessage ? 1000 : 0, // Duration of the slide-in effect
        easing: Easing.out(Easing.sin), // Sine ease-out effect
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <Animated.View
      style={[
        isLocalUser ? styles.localUserMessage : styles.otherUserMessage,
        { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.username, { color: getColorFromUsername(message.userName) }]}>
          {message.userName.charAt(0).toUpperCase() + message.userName.slice(1).toLowerCase()}
        </Text>
        <Text style={styles.date}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      <Text style={styles.message}>{message.message}</Text>
    </Animated.View>
  );
}

export default ChatMessageItem;

const styles = StyleSheet.create({
    message: {
      padding: 2,
      marginVertical: 4,
      maxWidth: '80%',
    },
    localUserMessage: {
      backgroundColor: '#b2dfdb',
      alignSelf: 'flex-end',
      padding: 10,
      marginTop: 10,
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3.84,
      elevation: 5,
      marginBottom: 10,
      minWidth: '50%',
    },
    otherUserMessage: {
      backgroundColor: '#e3ffed',
      alignSelf: 'flex-start',
      padding: 10,
      marginTop: 10,
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3.84,
      elevation: 5,
      marginBottom: 10,
      minWidth: '50%',
    },
    username: {
      fontWeight: 'bold',
      marginBottom: 4,
    },
    date: {
      fontSize: 10,
      color: '#888',
      marginTop: 4,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
});
  