import React, { useRef, useEffect, useState } from 'react';
import { View, Animated, Easing, StyleSheet, TouchableOpacity, PanResponder } from 'react-native';
import { Text } from '../components/Themed';
import { ChatMessage, MessageType } from '../types/ChatMessage';
import { getColorFromUsername } from '../utils/colorUtils';// Assuming styles are in a separate file
import { UserDetails } from '../types/UserDetails';
import ProfileImage from './ProfileImage';
import CachedImage from './CachedImage';
import { Map } from './Map';

function ChatMessageItem({ message, showName, user, isLocalUser, onPress, onLongPress }: { message: ChatMessage, showName: boolean, user: UserDetails | null, isLocalUser: boolean, onPress?: (message: ChatMessage) => void, onLongPress?: (message: ChatMessage) => void }) {
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial opacity value
  const slideAnim = useRef(new Animated.Value(isLocalUser ? 300 : -300)).current; // Initial position value
  const pan = useRef(new Animated.ValueXY()).current; // Add this line
  const [messageUser, setMessageUser] = useState<UserDetails | null>(user);
  const [emoticons, setEmoticons] = useState(message.emoticons || []);

  useEffect(() => {
      setMessageUser(user);
  }, [user]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: message.newMessage ? 1000 : 0, // Duration of the fade-in effect
        useNativeDriver: false,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: message.newMessage ? 1000 : 0, // Duration of the slide-in effect
        easing: Easing.out(Easing.sin), // Sine ease-out effect
        useNativeDriver: false,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        onPress && onPress(message);
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  const handleEmoticonPress = (index: number) => {
    setEmoticons(prevEmoticons => prevEmoticons.filter((_, i) => i !== index));
  };

  return (
      <Animated.View 
        {...panResponder.panHandlers}
        style={[
          isLocalUser ? styles.localUserMessageContainer : styles.otherUserMessageContainer,
          { opacity: fadeAnim, transform: [{ translateX: slideAnim }, ...pan.getTranslateTransform()] },
        ]}
      >
        <TouchableOpacity onLongPress={() => onLongPress && onLongPress(message)} style={styles.messageContainer}>
          {messageUser && !isLocalUser && <ProfileImage showVerifiedMark={false} user={messageUser} style={[styles.profileImage, { marginRight: 10 }]}/>}
          <Animated.View
          style={[
            isLocalUser ? styles.localUserMessage : styles.otherUserMessage,
            { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
          ]}
        >
          {showName && (
            <View style={styles.header}>
              <Text style={[styles.username, { color: getColorFromUsername(message.userName) }]}>
                {message.userName.charAt(0).toUpperCase() + message.userName.slice(1).toLowerCase()}
              </Text>
            </View>
          )}

          {message.replyToChatMessage && 
          <View style={styles.replyToContainer}>
            <Text style={[styles.username, { color: getColorFromUsername(message.replyToChatMessage.userName) }]}>
              {message.replyToChatMessage.userName.charAt(0).toUpperCase() + message.replyToChatMessage.userName.slice(1).toLowerCase()}
              </Text>
            <Text style={styles.replyTo}>{message.replyToChatMessage.message}</Text>
          </View>
          }
          {message.type === MessageType.Image && <CachedImage url={message.imageUrl} style={styles.messageImage}/>}
          {message.type === MessageType.Location && message.location && (
            <Map
              initialRegion={{
                latitude: message.location.latitude,
                longitude: message.location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              markers={[{ id: message.id, coordinate: message.location }]}
              style={styles.map}
            />
          )}
          <Text style={styles.message}>{message.message}</Text>
          <Text style={styles.date}>
              {new Date(message.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
        </Animated.View>
        <View style={styles.emoticonsContainer}>
          {emoticons.map((emotion, index) => (
            <TouchableOpacity key={index} onPress={() => handleEmoticonPress(index)}>
              <Text>{emotion}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {messageUser && isLocalUser && <ProfileImage showVerifiedMark={false} user={messageUser} style={[styles.profileImage, { marginLeft: 10 }]}/>}
        </TouchableOpacity>
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
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3.84,
      elevation: 5,
      marginBottom: 10,
      minWidth: '50%',
      minHeight: 50,
    },
    otherUserMessage: {
      backgroundColor: '#e3ffed',
      padding: 10,
      marginTop: 10,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3.84,
      elevation: 5,
      marginBottom: 10,
      minWidth: '50%',
      minHeight: 50,

    },
    username: {
      fontWeight: 'bold',
      marginBottom: 4,
    },
    date: {
      fontSize: 10,
      color: '#888',
      marginTop: -20,
      flex: 1,
      textAlign: 'right',
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
    messageContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    messageImage: {
      width: 200,
      height: 200,
      borderRadius: 10,
    },
    replyTo: {
      fontSize: 12,
      color: '#888',
      marginTop: 1,
      flex: 1,
      textAlign: 'left',
    },
    replyToContainer: {
      backgroundColor: '#e3ffed',
      padding: 10,
      borderRadius: 5,
    },
    emoticonsContainer: {
      backgroundColor: 'white',
      padding: 2,
      borderRadius: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'absolute',
      bottom: -5,
      left: 0,
      zIndex: 1000,
      marginTop: 40,
      marginLeft: 10,
    },
    map: {
      width: '100%',
      height: 200,
      borderRadius: 10,
      marginVertical: 10,
    },
});
  