import { Dimensions } from "react-native";

export enum DeviceType {
    Phone = 'phone',
    Tablet = 'tablet'
}

export const isTablet = Dimensions.get('window').width >= 768;

export const getDeviceType = () => {
    return isTablet ? DeviceType.Tablet : DeviceType.Phone;
}