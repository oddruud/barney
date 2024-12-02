import React, { useRef, useEffect } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import { Text } from '../components/Themed';
import { ChatMessage } from '../types/ChatMessage';
import { getColorFromUsername } from '../utils/colorUtils';// Assuming styles are in a separate file

function ChatMessageItem({ message }: { message: ChatMessage }) {
  const isLocalUser = message.userName === 'You'; // Assuming 'You' is the local username
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
          {message.userName}
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
      padding: 12,
      marginVertical: 4,
      borderRadius: 20,
      maxWidth: '80%',
    },
    localUserMessage: {
      backgroundColor: '#b2dfdb',
      alignSelf: 'flex-end',
      padding: 10,
      marginTop: 10,
      borderWidth: 1,
      borderColor: '#00796b',
      borderRadius: 20,
    },
    otherUserMessage: {
      backgroundColor: '#e3ffed',
      alignSelf: 'flex-start',
      padding: 10,
      marginTop: 10,
      borderWidth: 1,
      borderColor: '#388e3c',
      borderRadius: 20,
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
  