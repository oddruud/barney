import React, { useState, useRef, useEffect } from 'react';
import { View, FlatList, TextInput, Button, StyleSheet, Animated, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Platform, KeyboardAvoidingView } from 'react-native';
import { ChatMessage } from '../types/ChatMessage';
import ChatMessageItem from './ChatMessageItem';
import { UserDetails } from '../types/UserDetails';
import { Text } from './Themed';
import { useData } from '@/contexts/DataContext';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { IconSymbol } from '../components/ui/IconSymbol';


type ChatComponentProps = {
  chatId: string;
  user: UserDetails | null;
};

export default function ChatComponent({chatId, user }: ChatComponentProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageCount, setMessageCount] = useState(0);
  const [inputText, setInputText] = useState('');
  const { dataProxy } = useData();
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial opacity value of 0
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const audioRecorderPlayer = useRef(new AudioRecorderPlayer()).current;
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceRecordingEnabled, setIsVoiceRecordingEnabled] = useState(false);
  useEffect(() => {
    // Load initial messages from dataProxy
    dataProxy.getChatMessages(chatId).then(initialMessages => {
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
    const intervalId = setInterval(async () => {
      await pollForNewMessages();
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [chatId]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1, // Fade to opacity 1
      duration: 500, // Duration of the fade animation
      useNativeDriver: true, // Use native driver for better performance
    }).start();
  }, [messages]); // Re-run the animation when messages change

  async function pollForNewMessages() {
    await dataProxy.getChatMessages(chatId).then(newMessages => {
      setMessages(prevMessages => {
        const newUniqueMessages = newMessages.filter(
          newMsg => !prevMessages.some(prevMsg => prevMsg.id === newMsg.id)
        );
        setMessageCount(prevMessages.length + newUniqueMessages.length);
        
        return [...prevMessages, ...newUniqueMessages];
      });
    });
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

  const handleSend = async () => {
    if (inputText.trim()) {
      const newMessage: ChatMessage = {
        id: '',
        timestamp: new Date().toISOString(),
        userName: user?.fullName || '',
        message: inputText,
        chatId: chatId,
        userId: user?.id || '',
        newMessage: true,
      };
     
      setInputText('');

      await dataProxy.addChatMessage(newMessage).then(() => {
      }).catch(error => {
      });

      await pollForNewMessages();
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

  const startRecording = async () => {
    try {
      const result = await audioRecorderPlayer.startRecorder();
      setIsRecording(true);
      console.log('Recording started:', result);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      setIsRecording(false);
      console.log('Recording stopped:', result);

      // Play the recorded audio file
      await audioRecorderPlayer.startPlayer(result);
      console.log('Playing recording:', result);
    } catch (error) {
      console.error('Failed to stop recording or play audio:', error);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
    style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }
    }>
  <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message"
        />
        <TouchableOpacity onPress={handleSend}>
          <IconSymbol name="paperplane.fill" size={40} color="white" style={styles.messageIcon} />
        </TouchableOpacity>
      </View>

      {isVoiceRecordingEnabled && (
        <Button
          title={isRecording ? "Stop Recording" : "Start Recording"}
          onPress={isRecording ? stopRecording : startRecording}
        />
      )}
    </View>
    </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
    width: '80%',
    marginRight: 10,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageIcon: {
    marginLeft: 10,
    backgroundColor: '#00796b',
    padding: 20,
    borderRadius: 20,
    marginBottom: 10,
  },
});
