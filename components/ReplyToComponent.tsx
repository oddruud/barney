import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChatMessage } from '../types/ChatMessage';
import { getColorFromUsername } from '../utils/colorUtils';

type ReplyToProps = {
  selectedMessage: ChatMessage;
  onClose: () => void;
};

const ReplyTo: React.FC<ReplyToProps> = ({ selectedMessage, onClose }) => {
  return (
    <View style={styles.replyToContainer}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
        <View style={{ backgroundColor: getColorFromUsername(selectedMessage.userName), height: "100%", width: 5, marginRight: 5 }}>
        </View>
        <View style={styles.innerReplyToContainer}>
          <Text style={[styles.replyToName, { color: getColorFromUsername(selectedMessage.userName) }]}>{selectedMessage.userName}</Text>
          <View style={styles.replyToMessageContainer}>
            <Text style={styles.replyTo}>{selectedMessage.message}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Text style={styles.closeButtonText}>X</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  replyToContainer: {
    backgroundColor: '#e3ffed',
    padding: 10,
    marginTop: 10,
    height: 50,
  },
  innerReplyToContainer: {},
  replyToMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  replyTo: {
    fontSize: 12,
    color: '#888',
  },
  closeButton: {
    marginLeft: 10,
    alignSelf: 'flex-end',
    marginTop: -30,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  replyToName: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ReplyTo;
