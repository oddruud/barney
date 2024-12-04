import { User } from "firebase/auth";
import { FirebaseError } from "firebase/app";
interface Authentication {
    signUpWithEmailAndPassword: (email: string, password: string) => Promise<User | null | FirebaseError>;
    loginWithEmailAndPassword: (email: string, password: string) => Promise<User | null | FirebaseError>;
    logout: () => Promise<void>;
}

export { Authentication };