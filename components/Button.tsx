import { TouchableOpacity, StyleSheet, TouchableOpacityProps } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
}

export function Button({ title, style, onPress, ...props }: ButtonProps) {
  const backgroundColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'background');

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor }, style]}
      activeOpacity={0.7}
      {...props}
    >
      <ThemedText
        style={styles.text}
        lightColor={textColor}
        darkColor={textColor}
      >
        {title}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
