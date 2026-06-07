import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { User, Bet, Comment, Game, Badge, BADGES } from './types';
import { toast } from 'sonner';
import { authService } from '@/services/authService';
import { firestoreService } from '@/services/firestoreService';

export interface AppContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  users: User[];
  games: Game[];
  bets: Bet[];
  comments: Comment[];
  isAdmin: boolean;
  isLoading: boolean;
  signUp: (email: string, password: string, name: string, area: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  placeBet: (gameId: string, scoreA: number, scoreB: number) => Promise<void>;
  getBetForGame: (gameId: string) => Bet | undefined;
  addComment: (text: string) => Promise<void>;
  likeComment: (commentId: string) => Promise<void>;
  addGame: (game: Omit<Game, 'id'>) => Promise<void>;
  updateGame: (id: string, data: Partial<Game>) => Promise<void>;
  deleteGame: (id: string) => Promise<void>;
  setGameResult: (gameId: string, scoreA: number, scoreB: number) => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
}

export const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
};

function evaluateBadges(user: User, bets: Bet[], games: Game[]): Badge[] {
  const userBets = bets.filter((b) => b.userId === user.id);
  const totalBets = userBets.length;

  let exactCount = 0;
  let consecutiveExact = 0;
  let maxConsecutiveExact = 0;
  let consecutiveCorrect = 0;
  let maxConsecutiveCorrect = 0;

  const finishedGames = games
    .filter((g) => g.finished)
    .sort((a, b) => a.date.localeCompare(b.date));

  for (const game of finishedGames) {
    const bet = userBets.find((b) => b.gameId === game.id);
    if (!bet || game.scoreA === undefined || game.scoreB === undefined) {
      consecutiveExact = 0;
      consecutiveCorrect = 0;
      continue;
    }
    const exact = bet.scoreA === game.scoreA && bet.scoreB === game.scoreB;
    const winner =
      (bet.scoreA > bet.scoreB && game.scoreA > game.scoreB) ||
      (bet.scoreA < bet.scoreB && game.scoreA < game.scoreB) ||
      (bet.scoreA === bet.scoreB && game.scoreA === game.scoreB);

    if (exact) {
      exactCount++;
      consecutiveExact++;
      consecutiveCorrect++;
    } else if (winner) {
      consecutiveExact = 0;
      consecutiveCorrect++;
    } else {
      consecutiveExact = 0;
      consecutiveCorrect = 0;
    }
    maxConsecutiveExact = Math.max(maxConsecutiveExact, consecutiveExact);
    maxConsecutiveCorrect = Math.max(maxConsecutiveCorrect, consecutiveCorrect);
  }

  return BADGES.map((badge) => {
    let earned = false;
    if (badge.id === 'estreante' && totalBets > 0) earned = true;
    if (badge.id === 'rei-palpite' && maxConsecutiveExact >= 2) earned = true;
    if (badge.id === 'on-fire' && maxConsecutiveCorrect >= 3) earned = true;
    if (badge.id === 'vidente' && exactCount >= 5) earned = true;
    if (badge.id === 'torcedor-fiel' && totalBets >= 6) earned = true;

    if (badge.id === 'zebra-master') {
      for (const game of finishedGames) {
        const bet = userBets.find((b) => b.gameId === game.id);
        if (!bet || game.scoreA === undefined || game.scoreB === undefined) continue;
        const allGameBets = bets.filter((b) => b.gameId === game.id);
        const betsOnA = allGameBets.filter((b) => b.scoreA > b.scoreB).length;
        const betsOnB = allGameBets.filter((b) => b.scoreB > b.scoreA).length;
        const userPickedA = bet.scoreA > bet.scoreB;
        const userPickedB = bet.scoreB > bet.scoreA;
        const isZebra =
          (userPickedA && betsOnA < betsOnB) || (userPickedB && betsOnB < betsOnA);
        const winner =
          (bet.scoreA > bet.scoreB && game.scoreA > game.scoreB) ||
          (bet.scoreA < bet.scoreB && game.scoreA < game.scoreB) ||
          (bet.scoreA === bet.scoreB && game.scoreA === game.scoreB);
        if (isZebra && winner) {
          earned = true;
          break;
        }
      }
    }
    return { ...badge, earned };
  });
}

function calculatePoints(bets: Bet[], games: Game[], users: User[]): User[] {
  const pointsMap: Record<string, number> = {};

  for (const bet of bets) {
    const game = games.find((g) => g.id === bet.gameId);
    if (!game || !game.finished || game.scoreA === undefined || game.scoreB === undefined)
      continue;

    let points = 0;
    const exactMatch = bet.scoreA === game.scoreA && bet.scoreB === game.scoreB;
    const winnerMatch =
      (bet.scoreA > bet.scoreB && game.scoreA > game.scoreB) ||
      (bet.scoreA < bet.scoreB && game.scoreA < game.scoreB) ||
      (bet.scoreA === bet.scoreB && game.scoreA === game.scoreB);

    if (exactMatch) points = 3;
    else if (winnerMatch) points = 2;

    pointsMap[bet.userId] = (pointsMap[bet.userId] || 0) + points;
  }

  return users.map((u) => ({ ...u, points: pointsMap[u.id] || 0 }));
}

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [bets, setBets] = useState<Bet[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Setup auth listener
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        try {
          const userData = await firestoreService.getUserById(authUser.uid);
          if (userData) {
            setUser(userData as User);
          } else {
            console.warn('User document not found in Firestore, creating one...');
            // Create user document if it doesn't exist
            await firestoreService.updateUser(authUser.uid, {
              id: authUser.uid,
              email: authUser.email || '',
              name: authUser.displayName || 'Usuário',
              area: '',
              points: 0,
              badges: [],
              consecutiveExact: 0,
              approved: true,
            } as Partial<User>);
            // Fetch the created user
            const newUserData = await firestoreService.getUserById(authUser.uid);
            if (newUserData) {
              setUser(newUserData as User);
            }
          }
          setFirebaseUser(authUser);
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Still set firebase user even if Firestore fetch fails
          setFirebaseUser(authUser);
        }
      } else {
        setUser(null);
        setFirebaseUser(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // Setup real-time listeners for games
  useEffect(() => {
    const unsubscribe = firestoreService.onGamesChange((gamesData) => {
      setGames(gamesData);
    });
    return unsubscribe;
  }, []);

  // Setup real-time listeners for bets
  useEffect(() => {
    const unsubscribe = firestoreService.onCommentsChange((commentsData) => {
      setComments(commentsData);
    });
    return unsubscribe;
  }, []);

  // Setup real-time listeners for users
  useEffect(() => {
    const unsubscribe = firestoreService.onUsersChange((usersData) => {
      setUsers(usersData);
    });
    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, name: string, area: string) => {
    try {
      await authService.signUp(email, password, name, area);
      toast.success('Conta criada com sucesso!');
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await authService.signIn(email, password);
      toast.success('Logado com sucesso!');
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setFirebaseUser(null);
      toast.success('Deslogado com sucesso!');
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    }
  };

  const placeBet = async (gameId: string, scoreA: number, scoreB: number) => {
    if (!user || !firebaseUser) return;

    try {
      const existingBets = bets.filter(
        (b) => b.gameId === gameId && b.userId === firebaseUser.uid
      );

      if (existingBets.length > 0) {
        // Note: Firestore update for existing bets would require bet IDs
        // For now, just add new bet (Firestore will handle duplicates)
        await firestoreService.placeBet({
          gameId,
          userId: firebaseUser.uid,
          scoreA,
          scoreB,
        });
      } else {
        await firestoreService.placeBet({
          gameId,
          userId: firebaseUser.uid,
          scoreA,
          scoreB,
        });
      }

      toast.success('Aposta registrada!');
    } catch (error) {
      toast.error('Erro ao registrar aposta');
      throw error;
    }
  };

  const getBetForGame = (gameId: string) => {
    if (!firebaseUser) return undefined;
    return bets.find((b) => b.gameId === gameId && b.userId === firebaseUser.uid);
  };

  const addComment = async (text: string) => {
    if (!user || !firebaseUser) return;

    try {
      await firestoreService.addComment({
        userId: firebaseUser.uid,
        userName: user.name,
        text,
      });
    } catch (error) {
      toast.error('Erro ao adicionar comentário');
      throw error;
    }
  };

  const likeComment = async (commentId: string) => {
    try {
      await firestoreService.likeComment(commentId);
    } catch (error) {
      toast.error('Erro ao curtir comentário');
      throw error;
    }
  };

  const addGame = async (game: Omit<Game, 'id'>) => {
    try {
      await firestoreService.addGame(game);
    } catch (error) {
      toast.error('Erro ao adicionar jogo');
      throw error;
    }
  };

  const updateGame = async (id: string, data: Partial<Game>) => {
    try {
      await firestoreService.updateGame(id, data);
    } catch (error) {
      toast.error('Erro ao atualizar jogo');
      throw error;
    }
  };

  const deleteGame = async (id: string) => {
    try {
      await firestoreService.deleteGame(id);
    } catch (error) {
      toast.error('Erro ao deletar jogo');
      throw error;
    }
  };

  const setGameResult = async (gameId: string, scoreA: number, scoreB: number) => {
    try {
      await firestoreService.setGameResult(gameId, scoreA, scoreB);
      toast.success('Resultado do jogo registrado!');
    } catch (error) {
      toast.error('Erro ao registrar resultado');
      throw error;
    }
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (!firebaseUser) return;

    try {
      await firestoreService.updateUser(firebaseUser.uid, data);
      toast.success('Perfil atualizado!');
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
      throw error;
    }
  };

  const value: AppContextType = {
    user,
    firebaseUser,
    users,
    games,
    bets,
    comments,
    isAdmin,
    isLoading,
    signUp,
    signIn,
    logout,
    placeBet,
    getBetForGame,
    addComment,
    likeComment,
    addGame,
    updateGame,
    deleteGame,
    setGameResult,
    updateUserProfile,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
