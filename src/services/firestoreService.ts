import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  writeBatch,
  Timestamp,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { Game, Bet, Comment, User, Badge } from '@/lib/types';

class FirestoreService {
  // ==================== GAMES ====================
  async getGames(): Promise<Game[]> {
    const gamesRef = collection(db, 'games');
    const snapshot = await getDocs(gamesRef);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Game));
  }

  onGamesChange(callback: (games: Game[]) => void) {
    const gamesRef = collection(db, 'games');
    return onSnapshot(gamesRef, (snapshot) => {
      const games = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Game));
      callback(games);
    });
  }

  async addGame(game: Omit<Game, 'id'>): Promise<string> {
    const gamesRef = collection(db, 'games');
    const docRef = await addDoc(gamesRef, {
      ...game,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  }

  async updateGame(gameId: string, updates: Partial<Game>): Promise<void> {
    const gameRef = doc(db, 'games', gameId);
    await updateDoc(gameRef, updates);
  }

  async setGameResult(
    gameId: string,
    scoreA: number,
    scoreB: number
  ): Promise<void> {
    const gameRef = doc(db, 'games', gameId);
    await updateDoc(gameRef, {
      scoreA,
      scoreB,
      finished: true,
    });
  }

  async deleteGame(gameId: string): Promise<void> {
    const gameRef = doc(db, 'games', gameId);
    await deleteDoc(gameRef);
  }

  // ==================== BETS ====================
  async placeBet(bet: Omit<Bet, 'id'>): Promise<string> {
    const betsRef = collection(db, 'bets');
    const docRef = await addDoc(betsRef, {
      ...bet,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  }

  async getBetsForGame(gameId: string): Promise<Bet[]> {
    const betsRef = collection(db, 'bets');
    const q = query(betsRef, where('gameId', '==', gameId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Bet));
  }

  async getUserBets(userId: string): Promise<Bet[]> {
    const betsRef = collection(db, 'bets');
    const q = query(betsRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Bet));
  }

  onUserBetsChange(userId: string, callback: (bets: Bet[]) => void) {
    const betsRef = collection(db, 'bets');
    const q = query(betsRef, where('userId', '==', userId));
    return onSnapshot(q, (snapshot) => {
      const bets = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Bet));
      callback(bets);
    });
  }

  // ==================== COMMENTS ====================
  async getComments(): Promise<Comment[]> {
    const commentsRef = collection(db, 'comments');
    const snapshot = await getDocs(commentsRef);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Comment));
  }

  onCommentsChange(callback: (comments: Comment[]) => void) {
    const commentsRef = collection(db, 'comments');
    return onSnapshot(commentsRef, (snapshot) => {
      const comments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Comment));
      callback(comments);
    });
  }

  async addComment(comment: Omit<Comment, 'id' | 'likes' | 'timestamp'>): Promise<string> {
    const commentsRef = collection(db, 'comments');
    const docRef = await addDoc(commentsRef, {
      ...comment,
      likes: 0,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  }

  async likeComment(commentId: string): Promise<void> {
    const commentRef = doc(db, 'comments', commentId);
    const commentDoc = await getDoc(commentRef);
    if (commentDoc.exists()) {
      const currentLikes = commentDoc.data().likes || 0;
      await updateDoc(commentRef, {
        likes: currentLikes + 1,
      });
    }
  }

  // ==================== USERS ====================
  async getUsers(): Promise<User[]> {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as User));
  }

  onUsersChange(callback: (users: User[]) => void) {
    const usersRef = collection(db, 'users');
    return onSnapshot(usersRef, (snapshot) => {
      const users = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as User));
      callback(users);
    });
  }

  async getUserById(userId: string): Promise<User | null> {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return {
        id: userDoc.id,
        ...userDoc.data(),
      } as User;
    }
    return null;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, updates);
  }

  async updateUserPoints(userId: string, points: number): Promise<void> {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const currentPoints = userDoc.data().points || 0;
      await updateDoc(userRef, {
        points: currentPoints + points,
      });
    }
  }

  async addBadgeToUser(userId: string, badge: Badge): Promise<void> {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const currentBadges = userDoc.data().badges || [];
      if (!currentBadges.find((b: Badge) => b.id === badge.id)) {
        await updateDoc(userRef, {
          badges: [...currentBadges, badge],
        });
      }
    }
  }
}

export const firestoreService = new FirestoreService();
