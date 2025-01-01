import React, { useState, useRef, useEffect } from 'react';
import { View, FlatList, TextInput, Button, Image, StyleSheet, Animated, TouchableOpacity, Keyboard, Platform, KeyboardAvoidingView } from 'react-native';
import { ChatMessage, MessageType } from '../types/ChatMessage';
import ChatMessageItem from './ChatMessageItem';
import { UserDetails } from '../types/UserDetails';
import { Text } from './Themed';
import { useData } from '@/contexts/DataContext';
import { IconSymbol } from '../components/ui/IconSymbol';
import { Timestamp } from 'firebase/firestore';
import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';
import ReplyTo from './ReplyToComponent';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const isRunningInExpoGo = Constants.appOwnership === 'expo';

type ChatComponentProps = {
  chatId: string;
  user: UserDetails | null;
};

const isLocationShareActive = false;

export default function ChatComponent({ chatId, user }: ChatComponentProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const { dataProxy } = useData();
  const flatListRef = useRef<FlatList>(null);
  const [uniqueUsers, setUniqueUsers] = useState<UserDetails[] | null>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceRecordingEnabled, setIsVoiceRecordingEnabled] = useState(false);
  const [localImageUrl, setLocalImageUrl] = useState('');
  const [remoteImageUrl, setRemoteImageUrl] = useState('');
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);

  useEffect(() => {
    dataProxy.getChatMessages(chatId).then(initialMessages => {
      setMessages(initialMessages.map(message => ({ ...message, newMessage: false })));
    });

    const intervalId = setInterval(pollForNewMessages, 1000);
    return () => clearInterval(intervalId);
  }, [chatId]);

  useEffect(() => {
    getUniqueUsers(messages).then(setUniqueUsers);
  }, [messages]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [messages]);

  const getUniqueUserIds = (messages: ChatMessage[]) => {
    return messages.map(message => message.userId).filter((value, index, self) => self.indexOf(value) === index);
  };

  const getUniqueUsers = async (messages: ChatMessage[]): Promise<UserDetails[]> => {
    const uniqueUserIds = getUniqueUserIds(messages);
    const uniqueUsers = await Promise.all(uniqueUserIds.map(userId => dataProxy.getUserDetailsById(userId)));
    return uniqueUsers.filter((user): user is UserDetails => user !== null);
  };

  const getUserById = (userId: string): UserDetails | null => {
    return uniqueUsers?.find(user => user.id === userId) || null;
  };

  const handleMessagePress = (message: ChatMessage) => {
    setSelectedMessage(message);
  };

  const handleMessageLongPress = (message: ChatMessage) => {
    message.emoticons = ["👍"];
    //update message in messages array
    setMessages(prevMessages => {
      const updatedMessages = prevMessages.map(msg => msg.id === message.id ? message : msg);
      return updatedMessages;
    });
   
  };

  async function pollForNewMessages() {
    const newMessages = await dataProxy.getChatMessages(chatId);
    setMessages(prevMessages => {
      const newUniqueMessages = newMessages.filter(newMsg => !prevMessages.some(prevMsg => prevMsg.id === newMsg.id));
      return [...prevMessages, ...newUniqueMessages];
    });
  }

  const renderItem = ({ item, index }: { item: ChatMessage, index: number }) => {
    const currentMessageDate = new Date(item.timestamp.toDate());
    const previousMessageDate = index > 0 ? new Date(messages[index - 1].timestamp.toDate()) : null;
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
        <ChatMessageItem message={item} showName={false} user={getUserById(item.userId)} isLocalUser={item.userId === user?.id} onPress={handleMessagePress} onLongPress={handleMessageLongPress} />
      </>
    );
  };

  const handleImageInclude = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      presentationStyle: 'popover' as any,
    });

    if (result.canceled) {
      setLocalImageUrl('');
      setRemoteImageUrl('');
      return;
    }

    const uri = result.assets?.[0]?.uri;
    const width = result.assets?.[0]?.width ?? 0;
    const height = result.assets?.[0]?.height ?? 0;
    setLocalImageUrl(uri);
    setIsImageUploading(true);

    try {
      const manipResult = await manipulateAsync(
        uri,
        [{ resize: { width: width / 4, height: height / 4 } }],
        { compress: 0.5, format: SaveFormat.JPEG }
      );

      const resizedUri = manipResult.uri;
      setLocalImageUrl(resizedUri);
      const imageURL = await dataProxy.uploadImage(resizedUri, onUploadProgress);
      setRemoteImageUrl(imageURL);
      setIsImageUploading(false);
    } catch (error) {
      console.log("error", error);
    }
  };

  const onUploadProgress = (progress: number) => {
    setUploadProgress(progress);
  };

  const handleLocationShare = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    const locationMessage: ChatMessage = {
      id: '',
      timestamp: Timestamp.fromDate(new Date()),
      userName: user?.fullName || '',
      message: inputText,
      chatId: chatId,
      userId: user?.id || '',
      newMessage: true,
      type: MessageType.Location,
    };

    await dataProxy.addChatMessage(locationMessage);
    await pollForNewMessages();
  };

  const handleSend = async () => {
    if ((inputText.trim() || localImageUrl || selectedMessage) && !isSending && !isImageUploading) {
      setIsSending(true);
      
      
      let messageType = MessageType.Text;

      if (remoteImageUrl) {
        messageType = MessageType.Image;
      }

      const newMessage: ChatMessage = {
        id: '',
        timestamp: Timestamp.fromDate(new Date()),
        userName: user?.fullName || '',
        message: inputText,
        chatId: chatId,
        userId: user?.id || '',
        newMessage: true,
        imageUrl: remoteImageUrl,
        type: messageType,
      };

      if (selectedMessage) {
        newMessage.replyToId = selectedMessage.id;
        newMessage.replyToChatMessage = selectedMessage;
      }

      setInputText('');
      setLocalImageUrl('');
      setRemoteImageUrl('');
      setSelectedMessage(null);
      await dataProxy.addChatMessage(newMessage);
      await pollForNewMessages();
      setIsSending(false);
    }
  };

  const handleScrollBegin = () => {
    setIsUserScrolling(true);
  };

  const handleScrollEnd = () => {
    setIsUserScrolling(false);
  };

  useEffect(() => {
    setTimeout(() => {
      scrollToEnd();
    }, 100);
  }, [messages.length]);

  const scrollToEnd = () => {
    if (flatListRef.current && !isUserScrolling) {
      flatListRef.current.scrollToEnd({ animated: false });
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingView}>
      <View style={[styles.chatContainer, selectedMessage && { marginTop: 50 }]}>
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
        {selectedMessage && (
          <ReplyTo selectedMessage={selectedMessage} onClose={() => setSelectedMessage(null)} />
        )}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message"
          />
          {!localImageUrl && (
            <TouchableOpacity onPress={handleImageInclude}>
              <View style={styles.imageButton}>
                <IconSymbol name="photo.fill" size={30} color="white" style={styles.messageIcon} />
              </View>
            </TouchableOpacity>
          )}
          {localImageUrl && (
            <TouchableOpacity onPress={handleImageInclude}>
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: localImageUrl }} style={styles.imagePreview} />
                {isImageUploading && (
                  <Text style={styles.uploadProgressText}>{uploadProgress}%</Text>
                )}
              </View>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleSend}>
            <View style={styles.sendButton}>
              <IconSymbol name="paperplane.fill" size={30} color="white" style={styles.messageIcon} />
            </View>
          </TouchableOpacity>
          {isLocationShareActive && (
            <TouchableOpacity onPress={handleLocationShare}>
              <View style={styles.locationButton}>
                <IconSymbol name="location.fill" size={30} color="white" style={styles.messageIcon} />
              </View>
            </TouchableOpacity>
          )}
        </View>
        {isVoiceRecordingEnabled && (
          <Button
            title={isRecording ? "Stop Recording" : "Start Recording"}
            onPress={isRecording ? stopRecording : startRecording}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  chatContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
    elevation: 5,
  },
  messagesContainer: {
    marginTop: 50,
  },
  input: {
    borderColor: '#00796b',
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    width: '70%',
    marginRight: 4,
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
    marginBottom: 15,
    padding: 5,
  },
  messageIcon: {},
  sendButton: {
    marginLeft: 5,
    padding: 10,
    borderRadius: 50,
    marginBottom: 10,
    backgroundColor: '#00796b',
  },
  locationButton: {
    marginLeft: 5,
    padding: 10,
    borderRadius: 50,
    marginBottom: 10,
    backgroundColor: '#00796b',
  },
  imageButton: {
    marginLeft: 5,
    padding: 10,
    borderRadius: 50,
    marginBottom: 10,
    backgroundColor: '#00796b',
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  imagePreview: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  uploadProgressText: {
    marginTop: -35,
    fontWeight: 'bold',
    color: 'white',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
});
