import React, { useState, useRef, useEffect } from 'react';
import { View, FlatList, TextInput, Button, StyleSheet, Animated, Image, Easing } from 'react-native';
import { Text } from '../components/Themed';
import { ChatMessage } from '../types/ChatMessage';


function ChatMessageItem({ message }: { message: ChatMessage }) {
  const isLocalUser = message.username === 'User'; // Assuming 'User' is the local username
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial opacity value
  const slideAnim = useRef(new Animated.Value(isLocalUser ? 300 : -300)).current; // Initial position value

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000, // Duration of the fade-in effect
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000, // Duration of the slide-in effect
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
       
        <Text style={styles.username}>{message.fullName}</Text>
        <Text style={styles.date}>
          {message.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      <Text style={styles.message}>{message.text}</Text>
    </Animated.View>
  );
}

export default function ChatComponent() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const handleSend = () => {
    if (inputText.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        date: new Date(),
        username: 'User', // Replace with actual username
        fullName: 'Bob', // Replace with actual full name
        text: inputText,
        profileImage: '', // Replace with actual profile image URL
      };
      setMessages([...messages, newMessage]);
      setInputText('');

      // Simulate a bot response
      setTimeout(() => {
        const botResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          date: new Date(),
          username: 'Bot',
          fullName: 'John Doe', // Replace with actual full name
          text: "Thanks for your message!",
          profileImage: '', // Replace with actual profile image URL
        };
        setMessages((prevMessages) => [...prevMessages, botResponse]);
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
  },
  otherUserMessage: {
    backgroundColor: '#e3ffed',
    alignSelf: 'flex-start',
    padding: 10,
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
