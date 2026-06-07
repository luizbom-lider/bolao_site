import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
  AuthError,
} from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';

export interface AuthUser extends User {
  displayName?: string | null;
  customClaims?: Record<string, any>;
}

class AuthService {
  async signUp(
    email: string,
    password: string,
    name: string,
    area: string
  ): Promise<AuthUser> {
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update display name in Firebase Auth
      await updateProfile(firebaseUser, {
        displayName: name,
      });

      // Create user document in Firestore
      const userRef = doc(db, 'users', firebaseUser.uid);
      await setDoc(userRef, {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name,
        area,
        points: 0,
        badges: [],
        consecutiveExact: 0,
        approved: true,
        createdAt: Timestamp.now(),
      });

      return firebaseUser as AuthUser;
    } catch (error) {
      const authError = error as AuthError;
      throw this.handleAuthError(authError);
    }
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user as AuthUser;
    } catch (error) {
      const authError = error as AuthError;
      throw this.handleAuthError(authError);
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      const authError = error as AuthError;
      throw this.handleAuthError(authError);
    }
  }

  getCurrentUser(): AuthUser | null {
    return auth.currentUser as AuthUser | null;
  }

  async updateUserProfile(updates: {
    displayName?: string;
    photoURL?: string;
  }): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    try {
      await updateProfile(user, updates);
    } catch (error) {
      const authError = error as AuthError;
      throw this.handleAuthError(authError);
    }
  }

  onAuthStateChanged(callback: (user: AuthUser | null) => void) {
    return auth.onAuthStateChanged((user) => {
      callback(user as AuthUser | null);
    });
  }

  private handleAuthError(error: AuthError): Error {
    const errorMessages: Record<string, string> = {
      'auth/user-not-found': 'Usuário não encontrado',
      'auth/wrong-password': 'Senha incorreta',
      'auth/email-already-in-use': 'Email já cadastrado',
      'auth/weak-password': 'Senha muito fraca (mínimo 6 caracteres)',
      'auth/invalid-email': 'Email inválido',
      'auth/user-disabled': 'Usuário desabilitado',
      'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde',
    };

    const message = errorMessages[error.code] || error.message;
    return new Error(message);
  }
}

export const authService = new AuthService();
