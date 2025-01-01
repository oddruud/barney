import React from 'react';
import { View, TextInput, StyleSheet, Animated } from 'react-native';
import { Text } from '@/components/Themed';
import { Button } from '@/components/Button';

export enum AuthAction {
    LOGIN = 'login',
    REGISTER = 'register',
    RESET = 'reset'
  }

export interface AuthState {
  email: string;
  password: string;
  isRegistering: boolean;
  forgotPasswordMode: boolean;
  showLoginForm: boolean;
  isLoggingIn: boolean;
}

export interface Message {
  message: string;
  type: 'error' | 'success';
}

interface LoginFormProps {
  authState: AuthState;
  setAuthState: React.Dispatch<React.SetStateAction<AuthState>>;
  message: Message | null;
  handleAuth: (action: AuthAction) => Promise<void>;
  buttonFadeAnim: Animated.Value;
}

export function LoginForm({ authState, setAuthState, message, handleAuth, buttonFadeAnim }: LoginFormProps) {
  const { email, password, isRegistering, forgotPasswordMode, showLoginForm } = authState;

  if (!showLoginForm) {
    return (
      <Animated.View style={[styles.loginButtonContainer, { opacity: buttonFadeAnim }]}>
        <Button
          style={styles.openButton}
          title="Let's Walk"
          onPress={() => setAuthState(prev => ({ ...prev, showLoginForm: true }))}
        />
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.loginButtonContainer, { opacity: buttonFadeAnim }]}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={email}
          onChangeText={(text) => setAuthState(prev => ({ ...prev, email: text }))}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        {!forgotPasswordMode && (
          <>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => setAuthState(prev => ({ ...prev, password: text }))}
              secureTextEntry
            />
          </>
        )}

        {message && (
          <Text style={{
            ...styles.messageText,
            color: message.type === 'error' ? 'red' : 'green'
          }}>
            {message.message}
          </Text>
        )}

        <View>
          {isRegistering ? (
            <Button
              style={styles.loginButton}
              title="Register"
              onPress={() => handleAuth(AuthAction.REGISTER)}
            />
          ) : (
            <>
              {!forgotPasswordMode && (
                <>
                  <Button
                    style={styles.loginButton}
                    title="Login"
                    onPress={() => handleAuth(AuthAction.LOGIN)}
                  />
                  <Button
                    style={styles.forgotPasswordButton}
                    textStyle={styles.forgotPasswordButtonText}
                    title="Forgot Password?"
                    onPress={() => setAuthState(prev => ({ ...prev, forgotPasswordMode: true }))}
                  />
                </>
              )}
              {forgotPasswordMode && (
                <>
                  <Button
                    style={[styles.loginButton, { width: 160 }]}
                    title="Reset Password"
                    onPress={() => handleAuth(AuthAction.RESET)}
                  />
                  <Button
                    style={[styles.loginRegisterSwitchButton, { width: 160 }]}
                    textStyle={styles.loginRegisterSwitchButtonText}
                    title="Back"
                    onPress={() => setAuthState(prev => ({ ...prev, forgotPasswordMode: false }))}
                  />
                </>
              )}
            </>
          )}
        </View>

        {!forgotPasswordMode && (
          <Button
            style={styles.loginRegisterSwitchButton}
            textStyle={styles.loginRegisterSwitchButtonText}
            title={isRegistering ? "Login" : "Register"}
            onPress={() => setAuthState(prev => ({ ...prev, isRegistering: !prev.isRegistering }))}
          />
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  loginButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    marginTop: 420,
  },
  inputContainer: {
    marginBottom: 30,
    width: '80%',
  },
  label: {
    color: 'white',
    marginBottom: 5,
  },
  input: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: 200,
  },
  messageText: {
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 1)',
    padding: 10,
    borderRadius: 5,
  },
  loginButton: {
    alignSelf: 'center',
    bottom: 10,
    opacity: 0.7,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 10,
    borderRadius: 10,
    width: 120,
    marginHorizontal: 10,
    marginTop: 20,
  },
  openButton: {
    alignSelf: 'center',
    bottom: 10,
    opacity: 0.7,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 10,
    borderRadius: 10,
    width: 120,
    marginHorizontal: 10,
    marginTop: 50,
  },
  forgotPasswordButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.0)',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    alignSelf: 'center',
  },
  forgotPasswordButtonText: {
    color: 'white',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  loginRegisterSwitchButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.0)',
    padding: 10,
    borderRadius: 10,
    marginTop: 30,
    alignSelf: 'center',
  },
  loginRegisterSwitchButtonText: {
    color: 'white',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
