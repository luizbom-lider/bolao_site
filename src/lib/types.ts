export interface User {
  id: string;
  name: string;
  email?: string;
  area: string;
  points: number;
  badges: Badge[];
  consecutiveExact: number;
  approved: boolean;
  isAdmin?: boolean;
}

export type BadgeTier = 'silver' | 'gold' | 'diamond';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: BadgeTier;
  requiredExact: number;
  earned: boolean;
  currentExact?: number;
}

export interface Game {
  id: string;
  teamA: string;
  teamB: string;
  flagA: string;
  flagB: string;
  date: string;
  time: string;
  group: string;
  scoreA?: number;
  scoreB?: number;
  finished: boolean;
}

export interface Bet {
  id?: string;
  gameId: string;
  userId: string;
  scoreA: number;
  scoreB: number;
  pointsEarned?: number;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
  likes: number;
}

export const BADGES: Badge[] = [
  { id: "prata", name: "Prata", description: "Acertou 1 placar exato", icon: "🥈", tier: "silver", requiredExact: 1, earned: false },
  { id: "ouro", name: "Ouro", description: "Acertou 3 placares exatos", icon: "🥇", tier: "gold", requiredExact: 3, earned: false },
  { id: "diamante", name: "Diamante", description: "Acertou 5 placares exatos", icon: "💎", tier: "diamond", requiredExact: 5, earned: false },
];

export const MOCK_GAMES: Game[] = [];

export const MOCK_USERS: User[] = [];

export const ACCESS_CODE = "LideresdoBolao";

export const AREAS = ["Marketing", "Recursos", "Comercial", "Diretoria", "Projetos"];
