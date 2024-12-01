import { TextInput, TextInputProps, StyleSheet, StyleProp, TextStyle } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextInputProps = Omit<TextInputProps, 'style'> & {
  lightColor?: string;
  darkColor?: string;
  style?: StyleProp<TextStyle>;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad' | 'decimal-pad';
  placeholder?: string;
};

export function ThemedTextInput({
  style,
  lightColor,
  darkColor,
  placeholderTextColor,
  value,
  onChangeText,
  keyboardType = 'default',
  placeholder,
  ...otherProps
}: ThemedTextInputProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  const borderColor = useThemeColor({}, 'icon');

  return (
    <TextInput
      style={[
        styles.input,
        { 
          color,
          backgroundColor,
          borderColor,
        },
        style,
      ]}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      placeholder={placeholder}
      placeholderTextColor={placeholderTextColor ?? borderColor}
      {...otherProps}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
});
