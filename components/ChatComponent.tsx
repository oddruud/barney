import React, { useState, useRef, useEffect } from 'react';
import { View, FlatList, TextInput, Button, StyleSheet, Animated, Image, Easing } from 'react-native';
import { ChatMessage } from '../types/ChatMessage';
import ChatMessageItem from './ChatMessageItem';
import { UserDetails } from '../types/UserDetails';
import { Text } from './Themed';
import { useEnvironment, Environment } from '@/contexts/EnvironmentContext';
import { useData } from '@/contexts/DataContext';


type ChatComponentProps = {
  walkId: string;
  user: UserDetails | null;
};

export default function ChatComponent({walkId, user }: ChatComponentProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageCount, setMessageCount] = useState(0);
  const [inputText, setInputText] = useState('');
  const { environment } = useEnvironment();
  const { dataProxy } = useData();
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial opacity value of 0
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  useEffect(() => {
    // Load initial messages from dataProxy
    dataProxy.getChatMessagesForWalk(walkId).then(initialMessages => {
      const updatedMessages = initialMessages.map(message => ({
        ...message,
        newMessage: false,
      }));
      setMessages(updatedMessages);
      
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated: false });
      }
    });

    // Poll for new messages every second
    const intervalId = setInterval(() => {
      dataProxy.getChatMessagesForWalk(walkId).then(newMessages => {
        setMessages(prevMessages => {
          const newUniqueMessages = newMessages.filter(
            newMsg => !prevMessages.some(prevMsg => prevMsg.id === newMsg.id)
          );
          setMessageCount(prevMessages.length + newUniqueMessages.length);
          
          return [...prevMessages, ...newUniqueMessages];
        });
      });
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [walkId]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1, // Fade to opacity 1
      duration: 500, // Duration of the fade animation
      useNativeDriver: true, // Use native driver for better performance
    }).start();
  }, [messages]); // Re-run the animation when messages change

  function simulateBotResponse(walkId: string) {
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

  const renderItem = ({ item, index }: { item: ChatMessage, index: number }) => {
    const currentMessageDate = new Date(item.timestamp);
    const previousMessageDate = index > 0 ? new Date(messages[index - 1].timestamp) : null;
    const isNewDay = !previousMessageDate || currentMessageDate.toDateString() !== previousMessageDate.toDateString();

    const today = new Date();
    const isToday = currentMessageDate.toDateString() === today.toDateString();

    return (
      <>
        {isNewDay && (
          <Animated.View style={[styles.dateSeparator, { opacity: fadeAnim }]}>
            <Text style={styles.dateText}>
              {isToday ? "Today" : currentMessageDate.toDateString()}
            </Text>
          </Animated.View>
        )}
        <ChatMessageItem message={item} isLocalUser={item.userId === user?.id} />
      </>
    );
  };

  const handleSend = () => {
    if (inputText.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        userName: user?.fullName ?? 'You',
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

      // Call the function to simulate a bot response
      if (environment === Environment.Development) {
        simulateBotResponse(walkId);
      }
    }
  };

  const handleScrollBegin = () => {
    setIsUserScrolling(true);
  };

  const handleScrollEnd = () => {
    setIsUserScrolling(false);
  };

  useEffect(() => {
    if (flatListRef.current && !isUserScrolling) {
      flatListRef.current.scrollToEnd({ animated: false });
    }
  }, [messages, messageCount]);

  return (
    <View style={styles.chatContainer}>
      <View style={styles.messagesContainer}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onScrollBeginDrag={handleScrollBegin}
          onScrollEndDrag={handleScrollEnd}
          onMomentumScrollEnd={handleScrollEnd}
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
    marginBottom: 20,
  },
  messagesContainer: {
    marginBottom: 20,
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
  dateSeparator: {
    padding: 10,
    alignSelf: 'center',
  },
  dateText: {
    color: '#00796b',
    fontSize: 16,
    fontWeight: 'bold',
  },
});