import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Modal, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '../components/Themed';
import { UserDetails } from '../types/UserDetails';
import { UserDetailsWithDistance } from '../types/UserDetailsWithDistance';
import { useData } from '@/contexts/DataContext';
import ProfileImage from './ProfileImage';
import { Link, router } from 'expo-router';


interface PeopleListProps {
  user: UserDetails;
};

const PeopleList: React.FC<PeopleListProps> = ({ user }) => {
  const { dataProxy } = useData();
  const [users, setUsers] = useState<UserDetailsWithDistance[]>([]);

  useEffect(() => {
    console.log("PeopleList for user", user.fullName);
    const getUsers = async () => {
      const users = await dataProxy.getUsersSortedByDistance(user, 30);
      console.log("Users", users);
      setUsers(users);
    }

    getUsers();
  }, []);


  return (
    <View style={styles.container}>
        <FlatList
          data={users}
          keyExtractor={(item) => item.email.toString()}
        renderItem={({ item }) => (
      
        <Link href={{ pathname: '/user-interaction/[id]', params: { id: item.id } }}>
            <View style={[styles.row,styles.userItem, {backgroundColor:'lightblue'}]}>
                <ProfileImage uri={item.profileImage} style={styles.profileImage} />
                <Text style={styles.name}>{item.fullName || 'Anonymous'}</Text>
                <Text style={styles.distance}>{item.distance.toFixed(1)}km</Text>
            </View>
          </Link>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  distance: {
    fontSize: 12,
    marginLeft: 16,
    color: 'gray',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
  userItem: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 10,
  },
});

export default PeopleList;
