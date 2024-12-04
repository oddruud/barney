import { auth } from '@/fireBaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { Authentication } from './AuthenticationInterface';
import { FirebaseError } from 'firebase/app';


class FireBaseAuthentication implements Authentication {

 async signUpWithEmailAndPassword (email: string, password: string): Promise<User | null | FirebaseError> {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed up 
        const user = userCredential.user;
        return user;
        // ...
      })
      .catch((error: FirebaseError) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
        return error;
      });

      return null;
    }

    async loginWithEmailAndPassword(email: string, password: string): Promise<User | null | FirebaseError> {
      signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        return user;
        // ...
      })
      .catch((error: FirebaseError) => {
        const errorCode = error.code;
        const errorMessage = error.message;
         console.log(errorCode, errorMessage);
         return error;
      });
      
      return null;
    }

    async logout(): Promise<void> {
      signOut(auth).then(() => {
        console.log("logout success");
      }).catch((error) => {
        console.log("logout error", error);
      });
    }

}




export default FireBaseAuthentication;