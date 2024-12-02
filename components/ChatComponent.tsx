import React, { useState, useRef, useEffect } from 'react';
import { View, FlatList, TextInput, Button, StyleSheet, Animated, Image, Easing } from 'react-native';
import { Text } from '../components/Themed';
import { ChatMessage } from '../types/ChatMessage';
import { dataProxy } from '@/data/DataProxy';

type ChatComponentProps = {
  walkId: string;
};

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

  const getColorFromUsername = (username: string) => {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = `hsl(${hash % 360}, 70%, 50%)`; // HSL color
    return color;
  };

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

export default function ChatComponent({walkId }: ChatComponentProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Load initial messages from dataProxy
    dataProxy.getChatMessagesForWalk(walkId).then(initialMessages => {
      const updatedMessages = initialMessages.map(message => ({
        ...message,
        newMessage: false,
      }));
      setMessages(updatedMessages);
    });
  }, [walkId]);

  const handleSend = () => {
    if (inputText.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        userName: 'You',
        message: inputText,
        walkId: walkId,
        userId: 1,
        newMessage: true,
      };
      setMessages([...(messages || []), newMessage]);
      setInputText('');

      // Simulate a bot response
      setTimeout(() => {
        const botResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          timestamp: new Date().toISOString(),
          userName: 'John Doe',
          message: "Thanks for your message!",
          walkId: walkId,
          userId: 1,
          newMessage: true,
        };
        setMessages((prevMessages = []) => [...prevMessages, botResponse]);
      }, 1000); // Respond after 1 second
    }
  };

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  return (
    <View style={styles.chatContainer}>
      <View style={styles.messagesContainer}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatMessageItem message={item} />}
        />
      </View>
      <TextInput
        style={styles.input}
        value={inputText}
        onChangeText={setInputText}
        placeholder="Type a message"
      />
      <Button title="Send" onPress={handleSend} />
    </View>
  );
}

const styles = StyleSheet.create({
  chatContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 12,
    borderRadius: 12,
    marginTop: 20,
    elevation: 5,
  },
  messagesContainer: {
    marginBottom: 8,
    marginTop: 50,
  },
  input: {
    borderColor: '#00796b',
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
  },
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
  },
  otherUserMessage: {
    backgroundColor: '#e3ffed',
    alignSelf: 'flex-start',
    padding: 10,
    marginTop: 10,
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
    marginRight: 8,
  },
});
