import React, { useState, useRef, useEffect } from 'react';
import { View, FlatList, TextInput, Button, StyleSheet, Animated, Image, Easing } from 'react-native';
import { ChatMessage } from '../types/ChatMessage';
import { dataProxy } from '@/data/DataProxy';
import ChatMessageItem from './ChatMessageItem';
import { UserDetails } from '../types/UserDetails';

type ChatComponentProps = {
  walkId: string;
  user: UserDetails | null;
};

export default function ChatComponent({walkId, user }: ChatComponentProps) {
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

    // Poll for new messages every second
    const intervalId = setInterval(() => {
      dataProxy.getChatMessagesForWalk(walkId).then(newMessages => {
        setMessages(prevMessages => {
          const newUniqueMessages = newMessages.filter(
            newMsg => !prevMessages.some(prevMsg => prevMsg.id === newMsg.id)
          );
          return [...prevMessages, ...newUniqueMessages];
        });
      });
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [walkId]);

  const handleSend = () => {
    if (inputText.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        userName: 'You',
        message: inputText,
        walkId: walkId,
        userId: user?.id ?? 0,
        newMessage: true,
      };
      setMessages([...(messages || []), newMessage]);
      setInputText('');

      // Send the message to the dataProxy
      dataProxy.addChatMessage(newMessage).then(() => {
        console.log('Message sent successfully');
      }).catch(error => {
        console.error('Error sending message:', error);
      });

      // Array of possible bot responses
      const botResponses = [
        "Thanks for your message!",
        "I'll get back to you soon.",
        "How can I assist you further?",
        "Your message has been received.",
        "Thank you for reaching out!"
      ];

      // Select a random message from the array
      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];

      // Simulate a bot response
      setTimeout(() => {
        const botResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          timestamp: new Date().toISOString(),
          userName: 'John Doe',
          message: randomResponse, // Use the random message
          walkId: walkId,
          userId: 10,
          newMessage: true,
        };

        dataProxy.addChatMessage(botResponse).then(() => {
            console.log('bot response sent successfully');
          }).catch(error => {
            console.error('Error sending message:', error);
          });

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
          renderItem={({ item }) => <ChatMessageItem message={item} isLocalUser={item.userId === user?.id} />}
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
});
