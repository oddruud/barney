import React, { useRef, useEffect, useState } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import { Text } from '../components/Themed';
import { ChatMessage } from '../types/ChatMessage';
import { getColorFromUsername } from '../utils/colorUtils';// Assuming styles are in a separate file
import { UserDetails } from '../types/UserDetails';
import ProfileImage from './ProfileImage';

function ChatMessageItem({ message, user, isLocalUser }: { message: ChatMessage, user: UserDetails | null, isLocalUser: boolean }) {
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial opacity value
  const slideAnim = useRef(new Animated.Value(isLocalUser ? 300 : -300)).current; // Initial position value
  const [messageUser, setMessageUser] = useState<UserDetails | null>(user);

  useEffect(() => {
      setMessageUser(user);
  }, [user]);

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
    <Animated.View  style={[
      isLocalUser ? styles.localUserMessageContainer : styles.otherUserMessageContainer,
      { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
    ]}>
       {messageUser && !isLocalUser && <ProfileImage showVerifiedMark={false} user={messageUser} style={[styles.profileImage, { marginRight: 10 }]}/>}
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
          {new Date(message.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      <Text style={styles.message}>{message.message}</Text>
    </Animated.View>
    {messageUser && isLocalUser && <ProfileImage showVerifiedMark={false} user={messageUser} style={[styles.profileImage, { marginLeft: 10 }]}/>}
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
    profileImage: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    localUserMessageContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      alignSelf: 'flex-end',
    },
    otherUserMessageContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
    },
});
  