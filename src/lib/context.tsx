import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { User, Bet, Comment, MOCK_USERS, MOCK_GAMES, Game, ACCESS_CODE, Badge, BADGES } from "./types";
import { toast } from "sonner";

interface AppContextType {
  user: User | null;
  users: User[];
  games: Game[];
  bets: Bet[];
  comments: Comment[];
  isAdmin: boolean;
  login: (name: string, area: string) => void;
  register: (name: string, area: string, code: string) => string | null;
  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
  logout: () => void;
  placeBet: (gameId: string, scoreA: number, scoreB: number) => void;
  getBetForGame: (gameId: string) => Bet | undefined;
  addComment: (text: string) => void;
  likeComment: (commentId: string) => void;
  addGame: (game: Omit<Game, "id">) => void;
  updateGame: (id: string, data: Partial<Game>) => void;
  deleteGame: (id: string) => void;
  setGameResult: (gameId: string, scoreA: number, scoreB: number) => void;
  approveUser: (userId: string) => void;
  rejectUser: (userId: string) => void;
  pendingUsers: User[];
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
};

const STORAGE_KEY = "bolao-copa-2026";
const ADMIN_PASSWORD = "admin2026";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveState(data: Record<string, unknown>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function evaluateBadges(user: User, bets: Bet[], games: Game[]): Badge[] {
  const userBets = bets.filter(b => b.userId === user.id);
  const totalBets = userBets.length;

  // Count exact matches and consecutive exact
  let exactCount = 0;
  let consecutiveExact = 0;
  let maxConsecutiveExact = 0;
  let consecutiveCorrect = 0;
  let maxConsecutiveCorrect = 0;

  const finishedGames = games.filter(g => g.finished).sort((a, b) => a.date.localeCompare(b.date));

  for (const game of finishedGames) {
    const bet = userBets.find(b => b.gameId === game.id);
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

  return BADGES.map(badge => {
    let earned = false;
    if (badge.id === "estreante" && totalBets > 0) earned = true;
    if (badge.id === "rei-palpite" && maxConsecutiveExact >= 2) earned = true;
    if (badge.id === "on-fire" && maxConsecutiveCorrect >= 3) earned = true;
    if (badge.id === "vidente" && exactCount >= 5) earned = true;
    if (badge.id === "torcedor-fiel" && totalBets >= 6) earned = true;
    // zebra-master: acertou resultado onde apostou no time com menos apostas
    if (badge.id === "zebra-master") {
      for (const game of finishedGames) {
        const bet = userBets.find(b => b.gameId === game.id);
        if (!bet || game.scoreA === undefined || game.scoreB === undefined) continue;
        const allGameBets = bets.filter(b => b.gameId === game.id);
        const betsOnA = allGameBets.filter(b => b.scoreA > b.scoreB).length;
        const betsOnB = allGameBets.filter(b => b.scoreB > b.scoreA).length;
        const userPickedA = bet.scoreA > bet.scoreB;
        const userPickedB = bet.scoreB > bet.scoreA;
        const isZebra = (userPickedA && betsOnA < betsOnB) || (userPickedB && betsOnB < betsOnA);
        const winner =
          (bet.scoreA > bet.scoreB && game.scoreA > game.scoreB) ||
          (bet.scoreA < bet.scoreB && game.scoreA < game.scoreB) ||
          (bet.scoreA === bet.scoreB && game.scoreA === game.scoreB);
        if (isZebra && winner) { earned = true; break; }
      }
    }
    return { ...badge, earned };
  });
}

function calculatePoints(bets: Bet[], games: Game[], users: User[]): User[] {
  const pointsMap: Record<string, number> = {};

  for (const bet of bets) {
    const game = games.find(g => g.id === bet.gameId);
    if (!game || !game.finished || game.scoreA === undefined || game.scoreB === undefined) continue;

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

  return users.map(u => ({ ...u, points: pointsMap[u.id] || 0 }));
}

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const saved = loadState();
  const [user, setUser] = useState<User | null>(saved?.user || null);
  const [users, setUsers] = useState<User[]>(saved?.users || MOCK_USERS);
  const [games, setGames] = useState<Game[]>(saved?.games || MOCK_GAMES);
  const [bets, setBets] = useState<Bet[]>(saved?.bets || []);
  const [isAdmin, setIsAdmin] = useState<boolean>(saved?.isAdmin || false);
  const [comments, setComments] = useState<Comment[]>(saved?.comments || []);

  useEffect(() => {
    saveState({ user, users, games, bets, comments, isAdmin });
  }, [user, users, games, bets, comments, isAdmin]);

  const login = (name: string, area: string) => {
    const existing = users.find(u => u.name.toLowerCase() === name.toLowerCase());
    if (existing && existing.approved) {
      setUser(existing);
    }
  };

  const register = (name: string, area: string, code: string): string | null => {
    if (code !== ACCESS_CODE) {
      return "Código de acesso inválido.";
    }
    const existing = users.find(u => u.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      if (existing.approved) {
        setUser(existing);
        return null;
      }
      return "Sua conta está aguardando aprovação do administrador.";
    }
    const newUser: User = {
      id: Date.now().toString(),
      name,
      area,
      points: 0,
      badges: [],
      consecutiveExact: 0,
      approved: true,
    };
    setUsers(prev => [...prev, newUser]);
    setUser(newUser);
    return null;
  };

  const loginAdmin = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => setIsAdmin(false);
  const logout = () => setUser(null);

  const approveUser = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, approved: true } : u));
  };

  const rejectUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const pendingUsers = users.filter(u => !u.approved);

  const placeBet = (gameId: string, scoreA: number, scoreB: number) => {
    if (!user) return;
    const existingIdx = bets.findIndex(b => b.gameId === gameId && b.userId === user.id);
    const newBet: Bet = { gameId, userId: user.id, scoreA, scoreB };
    let updatedBets: Bet[];
    if (existingIdx >= 0) {
      updatedBets = bets.map((b, i) => i === existingIdx ? newBet : b);
    } else {
      updatedBets = [...bets, newBet];
    }
    setBets(updatedBets);

    // Evaluate badges for current user
    const newBadges = evaluateBadges(user, updatedBets, games);
    const oldBadges = user.badges || [];
    newBadges.forEach(b => {
      if (b.earned && !oldBadges.find(ob => ob.id === b.id && ob.earned)) {
        toast.success(`🎉 Badge desbloqueado: ${b.icon} ${b.name}!`, { duration: 4000 });
      }
    });
    const updatedUser = { ...user, badges: newBadges };
    setUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
  };

  const getBetForGame = (gameId: string) => {
    if (!user) return undefined;
    return bets.find(b => b.gameId === gameId && b.userId === user.id);
  };

  const addComment = (text: string) => {
    if (!user) return;
    setComments(prev => [{
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      text,
      timestamp: new Date().toISOString(),
      likes: 0,
    }, ...prev]);
  };

  const likeComment = (commentId: string) => {
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, likes: c.likes + 1 } : c));
  };

  const addGame = (game: Omit<Game, "id">) => {
    const newGame: Game = { ...game, id: Date.now().toString() };
    setGames(prev => [...prev, newGame]);
  };

  const updateGame = (id: string, data: Partial<Game>) => {
    setGames(prev => prev.map(g => g.id === id ? { ...g, ...data } : g));
  };

  const deleteGame = (id: string) => {
    setGames(prev => prev.filter(g => g.id !== id));
    setBets(prev => prev.filter(b => b.gameId !== id));
  };

  const setGameResult = (gameId: string, scoreA: number, scoreB: number) => {
    const updatedGames = games.map(g =>
      g.id === gameId ? { ...g, scoreA, scoreB, finished: true } : g
    );
    setGames(updatedGames);
    const updatedUsers = calculatePoints(bets, updatedGames, users);
    
    // Evaluate badges for all users and notify new badges
    const usersWithBadges = updatedUsers.map(u => {
      const newBadges = evaluateBadges(u, bets, updatedGames);
      const oldBadges = u.badges || [];
      // Find newly earned badges
      newBadges.forEach(b => {
        if (b.earned && !oldBadges.find(ob => ob.id === b.id && ob.earned)) {
          toast.success(`${u.name} desbloqueou: ${b.icon} ${b.name}!`, { duration: 4000 });
        }
      });
      return { ...u, badges: newBadges };
    });
    setUsers(usersWithBadges);
    
    // Update current user if logged in
    if (user) {
      const updatedCurrent = usersWithBadges.find(u => u.id === user.id);
      if (updatedCurrent) setUser(updatedCurrent);
    }
  };

  return (
    <AppContext.Provider value={{
      user, users, games, bets, comments, isAdmin,
      login, register, loginAdmin, logoutAdmin, logout,
      placeBet, getBetForGame, addComment, likeComment,
      addGame, updateGame, deleteGame, setGameResult,
      approveUser, rejectUser, pendingUsers,
    }}>
      {children}
    </AppContext.Provider>
  );
};
