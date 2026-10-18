import { GuildInfo, Squad, Player, Notice } from '../types';

// Asset paths
export const ASSETS = {
  logo: '/src/assets/images/ego_empire_shield_logo_1789647190135.jpg',
  heroBg: '/src/assets/images/hero_esports_bg_1789384362904.jpg',
  tournamentStage: '/src/assets/images/tournament_stage_1789384377374.jpg',
  squadBattle: '/src/assets/images/squad_battle_play_1789384401965.jpg',
  officerLeader: '/src/assets/images/rabby_ego_break_1789650090284.jpg',
  charHayato: '/src/assets/images/char_hayato_1789650422472.jpg',
  charAlok: '/src/assets/images/char_alok_1789650441498.jpg',
  charChrono: '/src/assets/images/char_chrono_1789650456642.jpg',
  charTatsuya: '/src/assets/images/char_tatsuya_1789650471433.jpg',
  charKMaster: '/src/assets/images/char_k_master_1789650485651.jpg',
  charWukong: '/src/assets/images/char_wukong_1789650501928.jpg',
  charOrion: '/src/assets/images/char_orion_1789650517830.jpg',
};

export const GUILD_DATA: GuildInfo = {
  name: 'EGO EMPIRE',
  stylizedName: 'ᎬᏀᎧ Ꭼᴍᴘɪꤪꤨʀᴇ',
  slogan: 'Built for Competition. Driven by Brotherhood.',
  tag: 'EGO',
  uid: '3072098620',
  game: 'Free Fire',
  level: 7,
  glory: 971515,
  region: 'Bangladesh',
  foundedYear: '2023',
  facebookUrl: 'https://www.facebook.com/share/1CN8FCDT8J/',
};

// Guild Capacity Constants
export const MAX_GUILD_PLAYERS = 55;
export const MAX_OFFICIAL_SQUAD_SLOTS = 40; // 8 squads * 5 slots
export const NO_SQUAD_ID = 'no-squad';
export const NO_SQUAD_NAME = 'NO SQUAD';

// The 8 EXACT Squad Names specified in user brief
export const INITIAL_SQUADS: Squad[] = [
  {
    id: 'sq-1',
    name: 'ᎬᏀᎧ Ꮖɴꜰɪɴɪᴛʏ',
    order: 1,
    maxSlots: 5,
    badge: 'INF',
    tagline: 'Apex Division & Infinite Supremacy',
  },
  {
    id: 'sq-2',
    name: 'ᎬᏀᎧ Ꮤᴀʀʀɪᴏʀꜱ',
    order: 2,
    maxSlots: 5,
    badge: 'WAR',
    tagline: 'Frontline Assault & Iron Vanguard',
  },
  {
    id: 'sq-3',
    name: 'ᎬᏀᎧ Ꮲʀᴇᴅᴀᴛᴏʀꜱ',
    order: 3,
    maxSlots: 5,
    badge: 'PRD',
    tagline: 'Aggressive Blitz & Zone Domination',
  },
  {
    id: 'sq-4',
    name: 'ᎬᏀᎧ Ꮪʜᴀᴅᴏᴡꜱ',
    order: 4,
    maxSlots: 5,
    badge: 'SHD',
    tagline: 'Stealth Infiltration & Flank Protocol',
  },
  {
    id: 'sq-5',
    name: 'ᎬᏀᎧ Ᏼʟᴀᴅᴇꜱ',
    order: 5,
    maxSlots: 5,
    badge: 'BLD',
    tagline: 'Surgical Precision & Rapid Elimination',
  },
  {
    id: 'sq-6',
    name: 'ᎬᏀᎧ Ꮋᴜɴᴛᴇʀꜱ',
    order: 6,
    maxSlots: 5,
    badge: 'HNT',
    tagline: 'Tactical Recon & Bounty Demolition',
  },
  {
    id: 'sq-7',
    name: 'EGO BLAST',
    order: 7,
    maxSlots: 5,
    badge: 'BLS',
    tagline: 'Explosive Entry & High-Damage Impact',
  },
  {
    id: 'sq-8',
    name: 'EGO PRIME',
    order: 8,
    maxSlots: 5,
    badge: 'PRM',
    tagline: 'High Command & Strategic Scrim Unit',
  },
];

// Clean empty players database - ZERO OLD PLAYERS
export const INITIAL_PLAYERS: Player[] = [];

// Initial official notice
export const INITIAL_NOTICES: Notice[] = [
  {
    id: 'notice-1',
    title: 'Welcome to the New EGO EMPIRE Guild Portal',
    content: 'Official announcement from EGO EMPIRE High Command:\n\nOur guild roster structure has been completely reorganized into 8 elite tactical divisions. Each squad has exactly 5 operative slots. Registered players will compete for war points in daily scrimmages and regional tournaments.\n\nAll members are requested to report to their squad commanders for verification.',
    published: true,
    priority: 'Pinned',
    author: 'High Command',
    createdAt: '2026-10-17T12:00:00.000Z',
    updatedAt: '2026-10-17T12:00:00.000Z',
  },
];
