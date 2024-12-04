import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth,initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';


// Optionally import the services that you want to use
// import {...} from "firebase/auth";
// import {...} from "firebase/database";
// import {...} from "firebase/firestore";
// import {...} from "firebase/functions";
// import {...} from "firebase/storage";


const firebaseConfig = {
    apiKey: "AIzaSyBhIEJFaTGis4EypP2ocFMjTTpM2eYE65Y",
    authDomain: "barney-2acbe.firebaseapp.com",
    databaseURL: 'https://project-id.firebaseio.com',
    projectId: "barney-2acbe",
    storageBucket: "barney-2acbe.firebasestorage.app",
    messagingSenderId: "808462843283",
    appId: "1:808462843283:web:277161e7d937f6a3adfc66",
    measurementId: "G-FVJSL87NHK"
  };

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });

// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase

export default app;
export const firestore = getFirestore(app);
export { auth };
