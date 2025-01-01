import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { DeviceType, getDeviceType } from '@/utils/deviceUtils';
interface TabButtonProps {
  title: string;
  isActive: boolean;
  onPress: () => void;
}

const deviceType = getDeviceType();
const tabPadding = deviceType === DeviceType.Phone ? 10 : 15;
const tabMarginRight = deviceType === DeviceType.Phone ? 10 : 20;

const TabButton = ({ title, isActive, onPress }: TabButtonProps) => (
  <TouchableOpacity 
    onPress={onPress} 
    style={isActive ? styles.activeTab : styles.tab}
  >
    <Text style={styles.tabText}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  tab: {
    padding: tabPadding,
    backgroundColor: '#0E1111',
    borderRadius: 10,
    marginRight: tabMarginRight,
  },
  activeTab: {
    padding: tabPadding,
    backgroundColor: '#00796b',
    borderRadius: 10,
    marginRight: tabMarginRight,
  },
  tabText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: deviceType === DeviceType.Phone ? 16 : 24,
  }
});

export default TabButton;
