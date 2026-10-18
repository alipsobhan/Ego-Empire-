import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { INITIAL_SQUADS, GUILD_DATA, INITIAL_NOTICES } from './src/data/guildData';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// ============================================================================
// SECURE ADMIN AUTH CONFIGURATION & PASSWORD HASHING
// Username: "ego12", Password: "1122" (stored as salted hash, never plain text)
// ============================================================================
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'ego12';
const ADMIN_SALT = process.env.ADMIN_SALT || 'ego_empire_secure_salt_esports_ff_99a';
const ADMIN_PASSWORD_HASH = crypto.pbkdf2Sync(
  process.env.ADMIN_PASSWORD || '1122',
  ADMIN_SALT,
  100000,
  64,
  'sha512'
).toString('hex');

function verifyAdminPassword(inputPassword: string): boolean {
  try {
    const inputHash = crypto.pbkdf2Sync(
      inputPassword,
      ADMIN_SALT,
      100000,
      64,
      'sha512'
    ).toString('hex');
    const a = Buffer.from(inputHash, 'hex');
    const b = Buffer.from(ADMIN_PASSWORD_HASH, 'hex');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// In-memory rate limiter against brute-force login attempts (Max 5 attempts / 15m lockout)
interface RateLimitRecord {
  attempts: number;
  lockoutUntil: number;
  lastAttempt: number;
}
const loginRateLimiter = new Map<string, RateLimitRecord>();

function checkLoginRateLimit(identifier: string): { allowed: boolean; waitMinutes?: number } {
  const now = Date.now();
  const record = loginRateLimiter.get(identifier);
  if (!record) return { allowed: true };

  if (record.lockoutUntil > now) {
    const waitMinutes = Math.ceil((record.lockoutUntil - now) / 60000);
    return { allowed: false, waitMinutes };
  }

  if (now - record.lastAttempt > 15 * 60 * 1000) {
    loginRateLimiter.delete(identifier);
    return { allowed: true };
  }

  return { allowed: true };
}

function recordFailedLoginAttempt(identifier: string) {
  const now = Date.now();
  const record = loginRateLimiter.get(identifier) || { attempts: 0, lockoutUntil: 0, lastAttempt: now };
  record.attempts += 1;
  record.lastAttempt = now;
  if (record.attempts >= 5) {
    record.lockoutUntil = now + 15 * 60 * 1000;
  }
  loginRateLimiter.set(identifier, record);
}

function resetLoginRateLimit(identifier: string) {
  loginRateLimiter.delete(identifier);
}

// In-memory active session tokens for authorized admins (24h validity)
interface AdminSession {
  token: string;
  adminName: string;
  createdAt: number;
  expiresAt: number;
}
const activeSessions = new Map<string, AdminSession>();

// Lazy-initialized Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// State Persistence File
const DATA_DIR = path.resolve(process.cwd(), 'data');
const STATE_FILE = path.join(DATA_DIR, 'guild_state.json');

interface PlayerRecord {
  id: string;
  name: string;
  inGameName: string;
  inGameId: string;
  squadId: string;
  warPoints: number;
  activityStatus: 'Active' | 'Inactive' | 'On Leave';
  isLeader?: boolean;
  role?: string;
  photo?: string;
  createdAt: string;
  updatedAt?: string;
}

interface SquadRecord {
  id: string;
  name: string;
  order: number;
  maxSlots: number;
  badge?: string;
  tagline?: string;
  leadPlayerId?: string;
  leadPlayerName?: string;
}

interface NoticeRecord {
  id: string;
  title: string;
  content: string;
  published: boolean;
  priority?: 'Normal' | 'Urgent' | 'Pinned';
  author?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuditLogRecord {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  performedBy: string;
}

interface GuildState {
  guildName: string;
  stylizedName: string;
  tag: string;
  uid: string;
  level: number;
  glory: number;
  region: string;
  game: string;
  squads: SquadRecord[];
  players: PlayerRecord[];
  notices: NoticeRecord[];
  auditLogs: AuditLogRecord[];
  lastUpdated: string;
}

function loadGuildState(): GuildState {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(STATE_FILE)) {
      const raw = fs.readFileSync(STATE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      // Validate squads structure matches 8 predefined squads
      if (Array.isArray(parsed.squads) && parsed.squads.length === 8) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading guild state, re-initializing:', err);
  }

  // Default clean state with ZERO old players and 8 exact squads
  const freshState: GuildState = {
    guildName: GUILD_DATA.name,
    stylizedName: GUILD_DATA.stylizedName,
    tag: GUILD_DATA.tag,
    uid: GUILD_DATA.uid,
    level: GUILD_DATA.level,
    glory: GUILD_DATA.glory,
    region: GUILD_DATA.region,
    game: GUILD_DATA.game,
    squads: INITIAL_SQUADS,
    players: [],
    notices: INITIAL_NOTICES,
    auditLogs: [
      {
        id: `log-${Date.now()}`,
        action: 'SYSTEM_INITIALIZE',
        details: 'EGO EMPIRE guild system initialized with 8 tactical squads and empty player database.',
        timestamp: new Date().toISOString(),
        performedBy: 'System',
      },
    ],
    lastUpdated: new Date().toISOString(),
  };

  saveGuildState(freshState);
  return freshState;
}

function saveGuildState(state: GuildState) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    state.lastUpdated = new Date().toISOString();
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving guild state:', err);
  }
}

let guildState: GuildState = loadGuildState();

// Audit logger helper
function addAuditLog(action: string, details: string, performedBy: string = 'Admin') {
  const newLog: AuditLogRecord = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    action,
    details,
    timestamp: new Date().toISOString(),
    performedBy,
  };
  guildState.auditLogs.unshift(newLog);
  // Keep last 100 audit logs
  if (guildState.auditLogs.length > 100) {
    guildState.auditLogs = guildState.auditLogs.slice(0, 100);
  }
}

// Authentication Middleware: Checks Bearer token
function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized: Administrator authentication token required.',
    });
  }

  const token = authHeader.split(' ')[1];
  const session = activeSessions.get(token);

  if (!session) {
    return res.status(401).json({
      error: 'Invalid administrator session. Please log in again.',
    });
  }

  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return res.status(401).json({
      error: 'Session expired. Please log in again.',
    });
  }

  (req as any).adminSession = session;
  next();
}

// ============================================================================
// PUBLIC API: GET GUILD STATE (Calculates squad points, rankings, stats live)
// ============================================================================
app.get('/api/guild/state', (_req: Request, res: Response) => {
  // Compute squad statistics live from real players data (Only official 8 squads)
  const squadStats = guildState.squads.map((sq) => {
    const squadPlayers = guildState.players.filter((p) => p.squadId === sq.id);
    const totalWarPoints = squadPlayers.reduce((sum, p) => sum + (p.warPoints || 0), 0);
    const occupiedSlots = squadPlayers.length;
    const leader = squadPlayers.find((p) => p.isLeader) || squadPlayers[0];

    return {
      ...sq,
      totalWarPoints,
      occupiedSlots,
      leadPlayerId: leader?.id,
      leadPlayerName: leader?.inGameName || leader?.name,
    };
  });

  // Calculate ranks based on totalWarPoints descending for 8 official squads
  const sortedForRank = [...squadStats].sort((a, b) => b.totalWarPoints - a.totalWarPoints);
  const rankedSquads = squadStats.map((sq) => {
    const rankIndex = sortedForRank.findIndex((s) => s.id === sq.id);
    return {
      ...sq,
      rank: rankIndex + 1,
    };
  });

  // Overall guild statistics (Max 55 registered players capacity)
  const totalPlayers = guildState.players.length;
  const activePlayers = guildState.players.filter((p) => p.activityStatus === 'Active').length;
  const inactivePlayers = guildState.players.filter((p) => p.activityStatus === 'Inactive').length;
  const onLeavePlayers = guildState.players.filter((p) => p.activityStatus === 'On Leave').length;
  const totalWarPoints = guildState.players.reduce((sum, p) => sum + (p.warPoints || 0), 0);
  
  // Official squads have 40 total slots (8 squads * 5 slots)
  const squadSlotsOccupied = guildState.players.filter((p) => p.squadId && p.squadId !== 'no-squad').length;
  const noSquadPlayers = guildState.players.filter((p) => !p.squadId || p.squadId === 'no-squad');
  const noSquadCount = noSquadPlayers.length;

  res.json({
    guildInfo: {
      name: guildState.guildName,
      stylizedName: guildState.stylizedName,
      tag: guildState.tag,
      uid: guildState.uid,
      game: guildState.game,
      level: guildState.level,
      glory: guildState.glory,
      region: guildState.region,
      foundedYear: GUILD_DATA.foundedYear,
      facebookUrl: GUILD_DATA.facebookUrl,
    },
    glory: guildState.glory,
    squads: rankedSquads,
    players: guildState.players,
    noSquadPlayers,
    notices: guildState.notices.filter((n) => n.published),
    allNoticesCount: guildState.notices.length,
    stats: {
      totalPlayers,
      maxGuildSlots: 55, // Strictly 55 registered players
      occupiedSlotsStr: `${totalPlayers} / 55`,
      squadSlotsOccupied,
      maxSquadSlots: 40,
      noSquadCount,
      activePlayers,
      inactivePlayers,
      onLeavePlayers,
      totalWarPoints,
      currentGlory: guildState.glory,
    },
    lastUpdated: guildState.lastUpdated,
  });
});

// ============================================================================
// ADMIN AUTH: Login (Username: "ego12", Password: "1122" verified via salted hash)
// ============================================================================
app.post('/api/admin/login', (req: Request, res: Response) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const { username, password } = req.body;

  // Check rate limiting (Max 5 attempts / 15m lockout)
  const rateCheck = checkLoginRateLimit(String(clientIp));
  if (!rateCheck.allowed) {
    return res.status(429).json({
      error: `Too many failed login attempts. Please wait ${rateCheck.waitMinutes} minutes before trying again.`,
    });
  }

  const cleanUser = username ? String(username).trim().toLowerCase() : '';
  const cleanPass = password ? String(password) : '';

  const isUserValid = cleanUser === ADMIN_USERNAME.toLowerCase();
  const isPassValid = verifyAdminPassword(cleanPass);

  if (!isUserValid || !isPassValid) {
    recordFailedLoginAttempt(String(clientIp));
    return res.status(401).json({
      error: 'Invalid username or password.',
    });
  }

  // Clear failed attempts upon successful authentication
  resetLoginRateLimit(String(clientIp));

  const token = `ego_adm_${crypto.randomBytes(32).toString('hex')}`;
  const session: AdminSession = {
    token,
    adminName: 'High Command Admin',
    createdAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };

  activeSessions.set(token, session);

  addAuditLog(
    'ADMIN_LOGIN',
    `Administrator session authenticated successfully from command terminal.`,
    session.adminName
  );
  saveGuildState(guildState);

  res.json({
    success: true,
    token,
    adminName: session.adminName,
    message: 'Authentication successful. Command Center unlocked.',
  });
});

// Admin verify session
app.get('/api/admin/verify', requireAdminAuth, (req: Request, res: Response) => {
  const session = (req as any).adminSession;
  res.json({
    valid: true,
    adminName: session.adminName,
  });
});

// Admin logout
app.post('/api/admin/logout', requireAdminAuth, (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    activeSessions.delete(token);
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

// ============================================================================
// ADMIN MEMBER MANAGEMENT (Add, Edit, Delete, Assign Squad, 55 Player Cap)
// ============================================================================

// A. Add New Player
app.post('/api/admin/players', requireAdminAuth, (req: Request, res: Response) => {
  const { name, inGameName, inGameId, squadId, warPoints, activityStatus, isLeader, role, photo } = req.body;

  if (!name || !inGameName) {
    return res.status(400).json({ error: 'Player Real Name and In-Game Name (IGN) are required.' });
  }

  // Enforce MAXIMUM 55 PLAYERS GUILD CAPACITY
  if (guildState.players.length >= 55) {
    return res.status(400).json({
      error: 'Maximum guild capacity reached (55/55 players). Cannot enlist additional operatives without deleting an existing record.',
    });
  }

  // Validate squad assignment: Either 'no-squad' (unassigned) OR one of the 8 squads
  const targetSquadId = squadId && squadId.trim() ? squadId.trim() : 'no-squad';
  let targetSquadName = 'NO SQUAD';

  if (targetSquadId !== 'no-squad') {
    const squad = guildState.squads.find((s) => s.id === targetSquadId);
    if (!squad) {
      return res.status(400).json({
        error: 'Invalid squad selected. Please choose one of the 8 EGO EMPIRE squads or NO SQUAD.',
      });
    }
    targetSquadName = squad.name;

    // Enforce MAXIMUM 5 PLAYERS PER SQUAD RULE on official divisions
    const currentSquadPlayers = guildState.players.filter((p) => p.squadId === targetSquadId);
    if (currentSquadPlayers.length >= (squad.maxSlots || 5)) {
      return res.status(400).json({
        error: `Squad "${squad.name}" is already at maximum capacity (${squad.maxSlots || 5}/5). Choose another squad or assign to NO SQUAD.`,
      });
    }
  }

  // Prevent duplicate player UID or IGN
  const cleanIgn = String(inGameName).trim().toLowerCase();
  const cleanUid = inGameId ? String(inGameId).trim() : '';

  const isDuplicate = guildState.players.some((p) => {
    if (p.inGameName.trim().toLowerCase() === cleanIgn) return true;
    if (cleanUid && p.inGameId && p.inGameId.trim() === cleanUid) return true;
    return false;
  });

  if (isDuplicate) {
    return res.status(400).json({
      error: `A player with this in-game nickname (${inGameName}) or UID (${inGameId}) already exists in the guild roster!`,
    });
  }

  // If new player is marked as leader in an official squad, unset previous leader
  if (isLeader && targetSquadId !== 'no-squad') {
    guildState.players.forEach((p) => {
      if (p.squadId === targetSquadId) p.isLeader = false;
    });
  }

  const newPlayer: PlayerRecord = {
    id: `ply-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: String(name).trim(),
    inGameName: String(inGameName).trim(),
    inGameId: cleanUid || `${Math.floor(100000000 + Math.random() * 900000000)}`,
    squadId: targetSquadId,
    warPoints: Math.max(0, Number(warPoints) || 0),
    activityStatus: ['Active', 'Inactive', 'On Leave'].includes(activityStatus)
      ? activityStatus
      : 'Active',
    isLeader: targetSquadId !== 'no-squad' ? Boolean(isLeader) : false,
    role: role ? String(role).trim() : 'Rusher / Entry',
    photo: photo ? String(photo).trim() : undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  guildState.players.push(newPlayer);
  const adminName = (req as any).adminSession.adminName;
  addAuditLog(
    'ADD_PLAYER',
    `Added operative ${newPlayer.inGameName} (${newPlayer.name}) assigned to ${targetSquadName}. Total players: ${guildState.players.length}/55.`,
    adminName
  );
  saveGuildState(guildState);

  res.status(201).json({
    success: true,
    player: newPlayer,
    message: `Operative ${newPlayer.inGameName} enlisted into ${targetSquadName} successfully!`,
  });
});

// B. Edit Player
app.put('/api/admin/players/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = guildState.players.findIndex((p) => p.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: 'Player record not found.' });
  }

  const existing = guildState.players[idx];
  const { name, inGameName, inGameId, squadId, warPoints, activityStatus, isLeader, role, photo } = req.body;

  const finalSquadId = squadId !== undefined ? (squadId.trim() || 'no-squad') : existing.squadId;

  // If squadId changed, verify target squad capacity
  if (finalSquadId !== existing.squadId && finalSquadId !== 'no-squad') {
    const targetSquad = guildState.squads.find((s) => s.id === finalSquadId);
    if (!targetSquad) {
      return res.status(400).json({ error: 'Target squad does not exist.' });
    }
    const targetSquadPlayers = guildState.players.filter((p) => p.squadId === finalSquadId && p.id !== id);
    if (targetSquadPlayers.length >= (targetSquad.maxSlots || 5)) {
      return res.status(400).json({
        error: `Cannot reassign: Squad "${targetSquad.name}" is already at full capacity (${targetSquad.maxSlots || 5}/5).`,
      });
    }
  }

  // If marked as leader, unset previous leader in target squad
  if (isLeader && finalSquadId !== 'no-squad') {
    guildState.players.forEach((p) => {
      if (p.squadId === finalSquadId && p.id !== id) {
        p.isLeader = false;
      }
    });
  }

  guildState.players[idx] = {
    ...existing,
    name: name !== undefined ? String(name).trim() : existing.name,
    inGameName: inGameName !== undefined ? String(inGameName).trim() : existing.inGameName,
    inGameId: inGameId !== undefined ? String(inGameId).trim() : existing.inGameId,
    squadId: finalSquadId,
    warPoints: warPoints !== undefined ? Math.max(0, Number(warPoints)) : existing.warPoints,
    activityStatus: activityStatus !== undefined ? activityStatus : existing.activityStatus,
    isLeader: finalSquadId !== 'no-squad' ? (isLeader !== undefined ? Boolean(isLeader) : existing.isLeader) : false,
    role: role !== undefined ? String(role).trim() : existing.role,
    photo: photo !== undefined ? (photo ? String(photo).trim() : undefined) : existing.photo,
    updatedAt: new Date().toISOString(),
  };

  const adminName = (req as any).adminSession.adminName;
  addAuditLog(
    'EDIT_PLAYER',
    `Updated details for operative ${guildState.players[idx].inGameName} (Squad: ${finalSquadId}).`,
    adminName
  );
  saveGuildState(guildState);

  res.json({
    success: true,
    player: guildState.players[idx],
    message: 'Player information updated successfully.',
  });
});

// B2. Move Player Squad (Fast Reassignment Endpoint)
app.post('/api/admin/players/:id/move-squad', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { targetSquadId } = req.body;

  const idx = guildState.players.findIndex((p) => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Player not found.' });
  }

  const player = guildState.players[idx];
  const cleanTarget = targetSquadId ? String(targetSquadId).trim() : 'no-squad';

  if (cleanTarget === player.squadId) {
    return res.json({ success: true, player, message: 'Operative is already in this division.' });
  }

  let targetSquadName = 'NO SQUAD';

  if (cleanTarget !== 'no-squad') {
    const targetSquad = guildState.squads.find((s) => s.id === cleanTarget);
    if (!targetSquad) {
      return res.status(400).json({ error: 'Target squad does not exist.' });
    }
    targetSquadName = targetSquad.name;

    const currentSquadCount = guildState.players.filter((p) => p.squadId === cleanTarget && p.id !== id).length;
    if (currentSquadCount >= (targetSquad.maxSlots || 5)) {
      return res.status(400).json({
        error: `Cannot move to "${targetSquad.name}": Division is full (${targetSquad.maxSlots || 5}/5 slots occupied).`,
      });
    }
  }

  player.squadId = cleanTarget;
  if (cleanTarget === 'no-squad') {
    player.isLeader = false;
  }
  player.updatedAt = new Date().toISOString();

  const adminName = (req as any).adminSession.adminName;
  addAuditLog(
    'MOVE_SQUAD',
    `Transferred operative ${player.inGameName} to ${targetSquadName}.`,
    adminName
  );
  saveGuildState(guildState);

  res.json({
    success: true,
    player,
    message: `Operative ${player.inGameName} successfully transferred to ${targetSquadName}.`,
  });
});

// C. Delete Player with confirmation
app.delete('/api/admin/players/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const player = guildState.players.find((p) => p.id === id);

  if (!player) {
    return res.status(404).json({ error: 'Player not found in guild roster.' });
  }

  guildState.players = guildState.players.filter((p) => p.id !== id);
  const adminName = (req as any).adminSession.adminName;
  addAuditLog(
    'DELETE_PLAYER',
    `Permanently removed operative ${player.inGameName} (${player.name}) from roster.`,
    adminName
  );
  saveGuildState(guildState);

  res.json({
    success: true,
    message: `Operative ${player.inGameName} permanently removed from guild roster.`,
  });
});

// ============================================================================
// B. WAR POINT MANAGEMENT (Add, Reduce, Set Points)
// ============================================================================
app.post('/api/admin/players/:id/war-points', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { mode, points } = req.body; // mode: 'add' | 'reduce' | 'set'

  const player = guildState.players.find((p) => p.id === id);
  if (!player) {
    return res.status(404).json({ error: 'Player record not found.' });
  }

  const numPoints = Number(points);
  if (isNaN(numPoints)) {
    return res.status(400).json({ error: 'Points must be a valid number.' });
  }

  const prevPoints = player.warPoints || 0;

  if (mode === 'add') {
    player.warPoints = prevPoints + Math.max(0, numPoints);
  } else if (mode === 'reduce') {
    player.warPoints = Math.max(0, prevPoints - Math.max(0, numPoints));
  } else {
    // 'set'
    player.warPoints = Math.max(0, numPoints);
  }

  player.updatedAt = new Date().toISOString();
  const adminName = (req as any).adminSession.adminName;
  addAuditLog(
    'UPDATE_WAR_POINTS',
    `Modified war points for ${player.inGameName} (${mode}: ${numPoints} pts, now ${player.warPoints} pts).`,
    adminName
  );
  saveGuildState(guildState);

  res.json({
    success: true,
    player,
    message: `War points updated: ${player.inGameName} now has ${player.warPoints} pts.`,
  });
});

// ============================================================================
// C. GLORY MANAGEMENT (Add, Reduce, Edit Guild Glory)
// ============================================================================
app.post('/api/admin/glory', requireAdminAuth, (req: Request, res: Response) => {
  const { mode, points } = req.body; // mode: 'add' | 'reduce' | 'set'
  const numPoints = Number(points);

  if (isNaN(numPoints)) {
    return res.status(400).json({ error: 'Glory points must be a valid number.' });
  }

  const prevGlory = guildState.glory || 0;

  if (mode === 'add') {
    guildState.glory = prevGlory + Math.max(0, numPoints);
  } else if (mode === 'reduce') {
    guildState.glory = Math.max(0, prevGlory - Math.max(0, numPoints));
  } else {
    // 'set'
    guildState.glory = Math.max(0, numPoints);
  }

  const adminName = (req as any).adminSession.adminName;
  addAuditLog(
    'UPDATE_GLORY',
    `Guild glory modified (${mode}: ${numPoints}, total: ${guildState.glory.toLocaleString()}).`,
    adminName
  );
  saveGuildState(guildState);

  res.json({
    success: true,
    glory: guildState.glory,
    message: `Guild glory updated to ${guildState.glory.toLocaleString()} points.`,
  });
});

// ============================================================================
// D. ACTIVITY STATUS MANAGEMENT (Active, Inactive, On Leave)
// ============================================================================
app.put('/api/admin/players/:id/activity', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['Active', 'Inactive', 'On Leave'].includes(status)) {
    return res.status(400).json({ error: 'Status must be "Active", "Inactive", or "On Leave".' });
  }

  const player = guildState.players.find((p) => p.id === id);
  if (!player) {
    return res.status(404).json({ error: 'Player record not found.' });
  }

  const oldStatus = player.activityStatus;
  player.activityStatus = status;
  player.updatedAt = new Date().toISOString();

  const adminName = (req as any).adminSession.adminName;
  addAuditLog(
    'UPDATE_ACTIVITY',
    `Changed activity status of ${player.inGameName} from ${oldStatus} to ${status}.`,
    adminName
  );
  saveGuildState(guildState);

  res.json({
    success: true,
    player,
    message: `Status of ${player.inGameName} changed to ${status}.`,
  });
});

// ============================================================================
// E. SQUAD MANAGEMENT (View, Rename, Manage Capacity)
// ============================================================================
app.put('/api/admin/squads/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, tagline, badge } = req.body;

  const idx = guildState.squads.findIndex((s) => s.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Squad not found.' });
  }

  const prevName = guildState.squads[idx].name;
  guildState.squads[idx] = {
    ...guildState.squads[idx],
    name: name !== undefined ? String(name).trim() : guildState.squads[idx].name,
    tagline: tagline !== undefined ? String(tagline).trim() : guildState.squads[idx].tagline,
    badge: badge !== undefined ? String(badge).trim() : guildState.squads[idx].badge,
  };

  const adminName = (req as any).adminSession.adminName;
  addAuditLog(
    'UPDATE_SQUAD',
    `Updated squad details for "${prevName}" (Now: "${guildState.squads[idx].name}").`,
    adminName
  );
  saveGuildState(guildState);

  res.json({
    success: true,
    squad: guildState.squads[idx],
    message: 'Squad details updated successfully.',
  });
});

// ============================================================================
// F. NOTICE MANAGEMENT (Create, Edit, Publish/Unpublish, Delete)
// ============================================================================

// Get all notices (admin only sees unpublished as well)
app.get('/api/admin/notices', requireAdminAuth, (_req: Request, res: Response) => {
  res.json({
    notices: guildState.notices,
  });
});

// Create Notice
app.post('/api/admin/notices', requireAdminAuth, (req: Request, res: Response) => {
  const { title, content, published, priority } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Notice title and content are required.' });
  }

  const adminName = (req as any).adminSession.adminName;

  const newNotice: NoticeRecord = {
    id: `notice-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: String(title).trim(),
    content: String(content).trim(),
    published: published !== undefined ? Boolean(published) : true,
    priority: ['Normal', 'Urgent', 'Pinned'].includes(priority) ? priority : 'Normal',
    author: adminName || 'High Command',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  guildState.notices.unshift(newNotice);
  addAuditLog('CREATE_NOTICE', `Created notice: "${newNotice.title}".`, adminName);
  saveGuildState(guildState);

  res.status(201).json({
    success: true,
    notice: newNotice,
    message: 'Notice announcement published successfully!',
  });
});

// Edit Notice
app.put('/api/admin/notices/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = guildState.notices.findIndex((n) => n.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: 'Notice not found.' });
  }

  const existing = guildState.notices[idx];
  const { title, content, published, priority } = req.body;

  guildState.notices[idx] = {
    ...existing,
    title: title !== undefined ? String(title).trim() : existing.title,
    content: content !== undefined ? String(content).trim() : existing.content,
    published: published !== undefined ? Boolean(published) : existing.published,
    priority: priority !== undefined ? priority : existing.priority,
    updatedAt: new Date().toISOString(),
  };

  const adminName = (req as any).adminSession.adminName;
  addAuditLog('EDIT_NOTICE', `Updated notice: "${guildState.notices[idx].title}".`, adminName);
  saveGuildState(guildState);

  res.json({
    success: true,
    notice: guildState.notices[idx],
    message: 'Notice updated successfully.',
  });
});

// Delete Notice
app.delete('/api/admin/notices/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const notice = guildState.notices.find((n) => n.id === id);

  if (!notice) {
    return res.status(404).json({ error: 'Notice not found.' });
  }

  guildState.notices = guildState.notices.filter((n) => n.id !== id);
  const adminName = (req as any).adminSession.adminName;
  addAuditLog('DELETE_NOTICE', `Deleted notice: "${notice.title}".`, adminName);
  saveGuildState(guildState);

  res.json({
    success: true,
    message: 'Notice removed successfully.',
  });
});

// ============================================================================
// G. AUDIT LOGS
// ============================================================================
app.get('/api/admin/audit-logs', requireAdminAuth, (_req: Request, res: Response) => {
  res.json({
    auditLogs: guildState.auditLogs,
  });
});

// ============================================================================
// AI CHAT ENDPOINT (EGO AI Assistant)
// ============================================================================
app.post('/api/chat', async (req: Request, res: Response) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message text is required' });
  }

  const ai = getGenAI();
  if (ai) {
    try {
      const prompt = `You are EGO AI, the official intelligence assistant of EGO EMPIRE (Free Fire Esports Guild).
Guild Info:
Name: EGO EMPIRE (Level 7)
UID: 3072098620
Glory: ${guildState.glory.toLocaleString()}
Total Registered Operatives: ${guildState.players.length}
The 8 Official Squads:
${guildState.squads.map((s, i) => `${i + 1}. ${s.name}`).join('\n')}

Website Features:
- Notice Mode (official guild bulletins)
- Squad Mode (8 dedicated squads with 5 player slots each)
- Admin Mode (secure administrative command portal)

User Query: "${message}"

Respond concisely, politely, and energetically in the user's language (English or Bengali).`;

      const result = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: prompt,
      });

      if (result && result.text) {
        return res.json({ reply: result.text });
      }
    } catch (err) {
      console.error('Gemini API error, falling back:', err);
    }
  }

  // Fallback response
  res.json({
    reply: `EGO EMPIRE High Command: We are currently competing with 8 elite tactical squads (including ᎬᏀᎧ Ꮖɴꜰɪɴɪᴛʏ, ᎬᏀᎧ Ꮤᴀʀʀɪᴏʀꜱ, ᎬᏀᎧ Ꮲʀᴇᴅᴀᴛᴏʀꜱ). Current Glory: ${guildState.glory.toLocaleString()}. Check our Notice Mode for the latest tournament announcements!`,
  });
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    squadsCount: guildState.squads.length,
    playersCount: guildState.players.length,
    glory: guildState.glory,
  });
});

// Mount Vite or static file handler
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EGO EMPIRE server running on http://localhost:${PORT}`);
  });
}

startServer();
