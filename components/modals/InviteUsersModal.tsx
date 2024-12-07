import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, TextInput, FlatList, TouchableOpacity, Image, Text, StyleSheet, Animated } from 'react-native';
import { UserDetails } from '@/types/UserDetails';
import { Button } from '@/components/Button';
import UserItem from './UserItem';

interface InviteUsersModalProps {
  visible: boolean;
  searchQuery: string;
  users: UserDetails[]; //TODO possibly change this to endpoint call to get users from backend
  onSelectUser: (user: UserDetails) => void;
  onClose: () => void;
}

const InviteUsersModal: React.FC<InviteUsersModalProps> = ({
  visible,
  searchQuery,
  users,
  onSelectUser,
  onClose,
}) => {
  const [query, setQuery] = useState(searchQuery);
  const [searchResults, setSearchResults] = useState<UserDetails[]>([]);

  const springAnim = useRef(new Animated.Value(0.8)).current; // Initial scale value

  useEffect(() => {
    if (visible) {
      Animated.spring(springAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    }
    
    setQuery('');
    setSearchResults([]);
  }, [visible]);

  const handleSearch = (query: string) => {
    setQuery(query);

    if (query === '') {
      setSearchResults([]);
      return;
    }
    console.log("searching for users", users.length);

    const results = users.filter(user => {
      if (user.fullName) {
        return user.fullName.toLowerCase().includes(query.toLowerCase());
      }
      return false;
    });

    //remove all users that dont have an id
    const resultsWithId = results.filter(user => user.id !== undefined);

    setSearchResults(resultsWithId);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.modalContainer, { transform: [{ scale: springAnim }] }]}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a user"
          value={query}
          onChangeText={handleSearch}
        />
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <UserItem user={item} onSelectUser={onSelectUser} />
          )}
        />
        <Button style={styles.modalCloseButton} title="Close" onPress={onClose} />
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  searchInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    width: '80%',
    marginBottom: 20,
    marginTop: 70,
  },
  userItem: {
    padding: 10,
    marginVertical: 5,
    width: '100%',
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#ffffff',
    fontSize: 18,
  },
  modalCloseButton: {
    marginTop: 20,
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 70,
    width: '50%',
  },
  userItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginVertical: 5,
    width: '50%',
  },
  userProfileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 10,
  },
});

export default InviteUsersModal;
