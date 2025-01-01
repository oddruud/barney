import { auth } from '@/fireBaseConfig';
import { createUserWithEmailAndPassword, deleteUser, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { Authentication } from './AuthenticationInterface';
import { FirebaseError } from 'firebase/app';


class FireBaseAuthentication implements Authentication {

 async signUpWithEmailAndPassword (email: string, password: string): Promise<User| null> {
    let userCredential = await createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("signup success", userCredential.user.email);
        // Signed up 
        const user = userCredential.user;
        return user;
        // ...
      })
      .catch((error: FirebaseError) => {
        console.log("signup error", error);
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
        throw error;
      });

      return userCredential;
    }

    async loginWithEmailAndPassword(email: string, password: string): Promise<User | null> {
      let userCredential = await signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        return user;
        // ...
      })
      .catch((error: FirebaseError) => {
        console.log("login error", error);
        const errorCode = error.code;
        const errorMessage = error.message;
         console.log(errorCode, errorMessage);
        throw error;
      });
      
      return userCredential;
    }

    async resetPassword(email: string): Promise<void> {
      await sendPasswordResetEmail(auth, email);
    }


    async deleteAccount(): Promise<void> {
      if (auth.currentUser) {
        console.log('Deleting account', auth.currentUser);
        await deleteUser(auth.currentUser);
      } else {
        console.error("No user currently signed in.");
      }
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