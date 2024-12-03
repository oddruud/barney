import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '../../components/Themed';
import SelectWalkInArea from '../../components/SelectWalkInArea';
import InviteView from '../../components/InviteView';

export default function SelectWalkScreen() {
  // State for managing active tab
  const [activeTab, setActiveTab] = useState('myArea');

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity onPress={() => setActiveTab('myArea')} style={activeTab === 'myArea' ? styles.activeTab : styles.tab}>
          <Text style={styles.tabText}>My Area</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('invites')} style={activeTab === 'invites' ? styles.activeTab : styles.tab}>
          <Text style={styles.tabText}>Invites</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'myArea' && (
        <SelectWalkInArea minSearchRadius={1} maxSearchRadius={50} initialStartDate={new Date()} initialEndDate={new Date(new Date().setDate(new Date().getDate() + 7))} />
      )}

      {activeTab === 'invites' && (
        <InviteView />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 32,
    backgroundColor: '#ffffff',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 16,
    padding: 16,
  },
  tab: {
    padding: 10,
    backgroundColor: '#0E1111',
    borderRadius: 10,
    marginRight: 10,
  },
  activeTab: {
    padding: 10,
    backgroundColor: '#00796b',
    borderRadius: 10,
    marginRight: 10,
  },
  tabText: {
    color: '#fff',
    fontWeight: 'bold',
  }
});
