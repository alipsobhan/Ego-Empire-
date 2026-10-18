export type ActivityStatus = 'Active' | 'Inactive' | 'On Leave';

export interface Player {
  id: string;
  name: string;
  inGameName: string;
  inGameId: string; // Free Fire UID
  squadId: string;
  warPoints: number;
  activityStatus: ActivityStatus;
  isLeader?: boolean;
  role?: 'IGL / Leader' | 'Sniper Ace' | 'Rusher / Entry' | 'Flanker / Support' | string;
  photo?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Squad {
  id: string;
  name: string;
  order: number;
  maxSlots: number; // 5 slots
  badge?: string;
  tagline?: string;
  leadPlayerId?: string;
  leadPlayerName?: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  published: boolean;
  priority?: 'Normal' | 'Urgent' | 'Pinned';
  author?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  performedBy: string;
}

export interface GuildInfo {
  name: string;
  stylizedName: string;
  slogan: string;
  tag: string;
  uid: string;
  game: string;
  level: number;
  glory: number;
  region: string;
  foundedYear: string;
  facebookUrl: string;
}

export interface GuildStateData {
  guildInfo: GuildInfo;
  glory: number;
  squads: Squad[];
  players: Player[];
  notices: Notice[];
  auditLogs: AuditLogEntry[];
  lastUpdated: string;
}

export type MainMode = 'notice' | 'squad' | 'admin';

export type ThemeId = 'blue' | 'cyan' | 'crimson' | 'gold' | 'emerald' | 'purple';

export interface ThemeOption {
  id: ThemeId;
  name: string;
  bengaliName: string;
  tagline: string;
  primary: string;
  primaryDeep: string;
  accent: string;
  bg: string;
  surface: string;
  rgb: string;
  particles: string[];
}
