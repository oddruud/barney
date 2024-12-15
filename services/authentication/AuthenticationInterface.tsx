import { User } from "firebase/auth";
import { FirebaseError } from "firebase/app";
interface Authentication {
    signUpWithEmailAndPassword: (email: string, password: string) => Promise<User| null>;
    loginWithEmailAndPassword: (email: string, password: string) => Promise<User| null>;
    logout: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
}

export { Authentication };