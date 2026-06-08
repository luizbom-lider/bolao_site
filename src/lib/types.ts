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

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
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
  { id: "rei-palpite", name: "Rei do Palpite", description: "Acertou o placar exato 2 vezes consecutivas", icon: "👑", earned: false },
  { id: "zebra-master", name: "Zebra Master", description: "Acertou um resultado improvável", icon: "🦓", earned: false },
  { id: "on-fire", name: "On Fire", description: "Acertou 3 jogos seguidos", icon: "🔥", earned: false },
  { id: "estreante", name: "Estreante", description: "Fez sua primeira aposta", icon: "⭐", earned: false },
  { id: "vidente", name: "Vidente", description: "Acertou 5 placares exatos", icon: "🔮", earned: false },
  { id: "torcedor-fiel", name: "Torcedor Fiel", description: "Apostou em todos os jogos da fase de grupos", icon: "🧡", earned: false },
];

export const MOCK_GAMES: Game[] = [];

export const MOCK_USERS: User[] = [];

export const ACCESS_CODE = "LideresdoBolao";

export const AREAS = ["Marketing", "Recursos", "Comercial", "Diretoria", "Projetos"];
