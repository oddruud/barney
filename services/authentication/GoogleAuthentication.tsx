import {
    GoogleSignin,
    statusCodes,
    isErrorWithCode,
    isSuccessResponse,
    isNoSavedCredentialFoundResponse,
  } from '@react-native-google-signin/google-signin';
  
  // Somewhere in your code
  const googleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
  
      if (isSuccessResponse(response)) {
        // read user's info
        console.log(response.data);
      } else if (response.type === 'cancelled') {
        // Handle the case where the user cancelled the sign-in process
        console.log('User cancelled the sign-in process.');
      } else if (isNoSavedCredentialFoundResponse(response)) {
        // Android and Apple only.
        // No saved credential found (user has not signed in yet, or they revoked access)
        // call `createAccount()`
      }
    } catch (error) {
      console.error(error);
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            // User cancelled the login flow
            break;
          case statusCodes.IN_PROGRESS:
            // Operation (e.g. sign in) is in progress already
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            // Play services not available or outdated
            break;
          default:
          // something else happened
        }
      } else {
        // an error that's not related to google sign in occurred
      }
    }
  };

  export default googleSignIn;