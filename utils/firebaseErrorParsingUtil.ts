import { FirebaseError } from 'firebase/app';

export const parseFirebaseError = (error: FirebaseError): string => {
    if (error.code === 'auth/invalid-email') {
        return 'Invalid email address';
    }
    if (error.code === 'auth/wrong-password') {
        return 'Wrong password';
    }
    if (error.code === 'auth/missing-password') {
        return 'Please enter a password';
    }
    if (error.code === 'auth/user-not-found') {
        return 'User not found';
    }
    if (error.code === 'auth/email-already-in-use') {
        return 'Email already in use';
    }
    if (error.code === 'auth/weak-password') {
        return 'Weak password';
    }
    if (error.code === 'auth/invalid-credential') {
        return 'username and/or password incorrect';
    }

    return error.code;
};
