import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Player,
  Squad,
  Notice,
  AuditLogEntry,
  GuildInfo,
  ActivityStatus,
  MainMode,
} from '../types';
import { GUILD_DATA, INITIAL_SQUADS, INITIAL_PLAYERS, INITIAL_NOTICES } from '../data/guildData';

export interface GuildStats {
  totalPlayers: number;
  maxGuildSlots: number;
  occupiedSlotsStr: string;
  squadSlotsOccupied: number;
  maxSquadSlots: number;
  noSquadCount: number;
  activePlayers: number;
  inactivePlayers: number;
  onLeavePlayers: number;
  totalWarPoints: number;
  currentGlory: number;
}

interface GuildDataContextType {
  // Modes
  activeMode: MainMode;
  setActiveMode: (mode: MainMode) => void;

  // Data
  guildInfo: GuildInfo;
  glory: number;
  squads: Squad[];
  players: Player[];
  noSquadPlayers: Player[];
  notices: Notice[];
  allNotices: Notice[];
  auditLogs: AuditLogEntry[];
  stats: GuildStats;
  isLoading: boolean;
  refreshData: () => Promise<void>;

  // Admin Auth
  isAuthenticated: boolean;
  token: string | null;
  adminName: string;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;

  // Member CRUD
  addPlayer: (data: {
    name: string;
    inGameName: string;
    inGameId?: string;
    squadId: string;
    warPoints?: number;
    activityStatus?: ActivityStatus;
    isLeader?: boolean;
    role?: string;
    photo?: string;
  }) => Promise<{ success: boolean; error?: string; message?: string }>;
  updatePlayer: (
    id: string,
    data: Partial<Player>
  ) => Promise<{ success: boolean; error?: string; message?: string }>;
  deletePlayer: (id: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  movePlayerSquad: (
    playerId: string,
    targetSquadId: string
  ) => Promise<{ success: boolean; error?: string; message?: string }>;

  // War Points
  updatePlayerWarPoints: (
    id: string,
    mode: 'add' | 'reduce' | 'set',
    points: number
  ) => Promise<{ success: boolean; error?: string; message?: string }>;

  // Activity Status
  updatePlayerActivity: (
    id: string,
    status: ActivityStatus
  ) => Promise<{ success: boolean; error?: string; message?: string }>;

  // Glory
  updateGlory: (
    mode: 'add' | 'reduce' | 'set',
    points: number
  ) => Promise<{ success: boolean; error?: string; message?: string }>;

  // Squad
  updateSquad: (
    id: string,
    data: { name?: string; tagline?: string; badge?: string }
  ) => Promise<{ success: boolean; error?: string; message?: string }>;

  // Notices
  createNotice: (data: {
    title: string;
    content: string;
    priority?: 'Normal' | 'Urgent' | 'Pinned';
    published?: boolean;
  }) => Promise<{ success: boolean; error?: string; message?: string }>;
  updateNotice: (
    id: string,
    data: Partial<Notice>
  ) => Promise<{ success: boolean; error?: string; message?: string }>;
  deleteNotice: (id: string) => Promise<{ success: boolean; error?: string; message?: string }>;

  // Audit Logs
  refreshAuditLogs: () => Promise<void>;
}

const GuildDataContext = createContext<GuildDataContextType | undefined>(undefined);

export const GuildDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Notice mode is the FIRST mode visitors see by default
  const [activeMode, setActiveMode] = useState<MainMode>('notice');

  const [guildInfo, setGuildInfo] = useState<GuildInfo>(GUILD_DATA);
  const [glory, setGlory] = useState<number>(GUILD_DATA.glory);
  const [squads, setSquads] = useState<Squad[]>(INITIAL_SQUADS);
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [notices, setNotices] = useState<Notice[]>(INITIAL_NOTICES);
  const [allNotices, setAllNotices] = useState<Notice[]>(INITIAL_NOTICES);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Admin Auth State
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('ego_admin_token');
  });
  const [adminName, setAdminName] = useState<string>(() => {
    return localStorage.getItem('ego_admin_name') || 'Admin';
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Compute stats live (Strictly 55 max registered guild players)
  const totalPlayers = players.length;
  const maxGuildSlots = 55;
  const squadSlotsOccupied = players.filter((p) => p.squadId && p.squadId !== 'no-squad').length;
  const noSquadPlayers = players.filter((p) => !p.squadId || p.squadId === 'no-squad');
  const noSquadCount = noSquadPlayers.length;
  const activePlayers = players.filter((p) => p.activityStatus === 'Active').length;
  const inactivePlayers = players.filter((p) => p.activityStatus === 'Inactive').length;
  const onLeavePlayers = players.filter((p) => p.activityStatus === 'On Leave').length;
  const totalWarPoints = players.reduce((sum, p) => sum + (p.warPoints || 0), 0);

  const stats: GuildStats = {
    totalPlayers,
    maxGuildSlots: 55,
    occupiedSlotsStr: `${totalPlayers} / 55`,
    squadSlotsOccupied,
    maxSquadSlots: 40,
    noSquadCount,
    activePlayers,
    inactivePlayers,
    onLeavePlayers,
    totalWarPoints,
    currentGlory: glory,
  };

  // Fetch Public State
  const refreshData = useCallback(async () => {
    try {
      const res = await fetch('/api/guild/state');
      if (res.ok) {
        const data = await res.json();
        if (data.guildInfo) setGuildInfo(data.guildInfo);
        if (typeof data.glory === 'number') setGlory(data.glory);
        if (data.squads) setSquads(data.squads);
        if (data.players) setPlayers(data.players);
        if (data.notices) setNotices(data.notices);
      }
    } catch (err) {
      console.error('Error fetching guild state:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch All Notices (for Admin)
  const refreshAllNotices = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/notices', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.notices) setAllNotices(data.notices);
      }
    } catch (err) {
      console.error('Error fetching all notices:', err);
    }
  }, [token]);

  // Fetch Audit Logs
  const refreshAuditLogs = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/audit-logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.auditLogs) setAuditLogs(data.auditLogs);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    }
  }, [token]);

  // Verify stored token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsAuthenticated(false);
        return;
      }
      try {
        const res = await fetch('/api/admin/verify', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setIsAuthenticated(true);
          if (data.adminName) setAdminName(data.adminName);
        } else {
          // Token invalid
          localStorage.removeItem('ego_admin_token');
          localStorage.removeItem('ego_admin_name');
          setToken(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Token verification error:', err);
      }
    };

    verifyToken();
    refreshData();
  }, [token, refreshData]);

  // When authenticated, load admin extras
  useEffect(() => {
    if (isAuthenticated && token) {
      refreshAllNotices();
      refreshAuditLogs();
    }
  }, [isAuthenticated, token, refreshAllNotices, refreshAuditLogs]);

  // Admin Login (Validates username and password via secure endpoint)
  const login = async (username: string, password: string) => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Invalid username or password.' };
      }

      setToken(data.token);
      setAdminName(data.adminName || 'High Command Admin');
      setIsAuthenticated(true);
      localStorage.setItem('ego_admin_token', data.token);
      localStorage.setItem('ego_admin_name', data.adminName || 'High Command Admin');

      await refreshData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Authentication error.' };
    }
  };

  // Admin Logout
  const logout = async () => {
    if (token) {
      try {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error('Error during logout:', err);
      }
    }
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('ego_admin_token');
    localStorage.removeItem('ego_admin_name');
  };

  // Member CRUD
  const addPlayer = async (data: {
    name: string;
    inGameName: string;
    inGameId?: string;
    squadId: string;
    warPoints?: number;
    activityStatus?: ActivityStatus;
    isLeader?: boolean;
    role?: string;
    photo?: string;
  }) => {
    if (!token) return { success: false, error: 'Unauthorized: Admin authentication required.' };
    try {
      const res = await fetch('/api/admin/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        return { success: false, error: result.error || 'Failed to add player.' };
      }
      await refreshData();
      await refreshAuditLogs();
      return { success: true, message: result.message };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updatePlayer = async (id: string, data: Partial<Player>) => {
    if (!token) return { success: false, error: 'Unauthorized.' };
    try {
      const res = await fetch(`/api/admin/players/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        return { success: false, error: result.error || 'Failed to update player.' };
      }
      await refreshData();
      await refreshAuditLogs();
      return { success: true, message: result.message };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deletePlayer = async (id: string) => {
    if (!token) return { success: false, error: 'Unauthorized.' };
    try {
      const res = await fetch(`/api/admin/players/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok) {
        return { success: false, error: result.error || 'Failed to delete player.' };
      }
      await refreshData();
      await refreshAuditLogs();
      return { success: true, message: result.message };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const movePlayerSquad = async (playerId: string, targetSquadId: string) => {
    if (!token) return { success: false, error: 'Unauthorized: Admin authentication required.' };
    try {
      const res = await fetch(`/api/admin/players/${playerId}/move-squad`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetSquadId }),
      });
      const result = await res.json();
      if (!res.ok) {
        return { success: false, error: result.error || 'Failed to transfer player.' };
      }
      await refreshData();
      await refreshAuditLogs();
      return { success: true, message: result.message };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // War Points
  const updatePlayerWarPoints = async (
    id: string,
    mode: 'add' | 'reduce' | 'set',
    points: number
  ) => {
    if (!token) return { success: false, error: 'Unauthorized.' };
    try {
      const res = await fetch(`/api/admin/players/${id}/war-points`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mode, points }),
      });
      const result = await res.json();
      if (!res.ok) {
        return { success: false, error: result.error || 'Failed to update points.' };
      }
      await refreshData();
      await refreshAuditLogs();
      return { success: true, message: result.message };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Activity Status
  const updatePlayerActivity = async (id: string, status: ActivityStatus) => {
    if (!token) return { success: false, error: 'Unauthorized.' };
    try {
      const res = await fetch(`/api/admin/players/${id}/activity`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const result = await res.json();
      if (!res.ok) {
        return { success: false, error: result.error || 'Failed to update activity.' };
      }
      await refreshData();
      await refreshAuditLogs();
      return { success: true, message: result.message };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Glory
  const updateGlory = async (mode: 'add' | 'reduce' | 'set', points: number) => {
    if (!token) return { success: false, error: 'Unauthorized.' };
    try {
      const res = await fetch('/api/admin/glory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mode, points }),
      });
      const result = await res.json();
      if (!res.ok) {
        return { success: false, error: result.error || 'Failed to update glory.' };
      }
      if (typeof result.glory === 'number') {
        setGlory(result.glory);
      }
      await refreshData();
      await refreshAuditLogs();
      return { success: true, message: result.message };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Squad
  const updateSquad = async (
    id: string,
    data: { name?: string; tagline?: string; badge?: string }
  ) => {
    if (!token) return { success: false, error: 'Unauthorized.' };
    try {
      const res = await fetch(`/api/admin/squads/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        return { success: false, error: result.error || 'Failed to update squad.' };
      }
      await refreshData();
      await refreshAuditLogs();
      return { success: true, message: result.message };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Notice CRUD
  const createNotice = async (data: {
    title: string;
    content: string;
    priority?: 'Normal' | 'Urgent' | 'Pinned';
    published?: boolean;
  }) => {
    if (!token) return { success: false, error: 'Unauthorized.' };
    try {
      const res = await fetch('/api/admin/notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        return { success: false, error: result.error || 'Failed to create notice.' };
      }
      await refreshData();
      await refreshAllNotices();
      await refreshAuditLogs();
      return { success: true, message: result.message };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updateNotice = async (id: string, data: Partial<Notice>) => {
    if (!token) return { success: false, error: 'Unauthorized.' };
    try {
      const res = await fetch(`/api/admin/notices/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        return { success: false, error: result.error || 'Failed to update notice.' };
      }
      await refreshData();
      await refreshAllNotices();
      await refreshAuditLogs();
      return { success: true, message: result.message };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deleteNotice = async (id: string) => {
    if (!token) return { success: false, error: 'Unauthorized.' };
    try {
      const res = await fetch(`/api/admin/notices/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok) {
        return { success: false, error: result.error || 'Failed to delete notice.' };
      }
      await refreshData();
      await refreshAllNotices();
      await refreshAuditLogs();
      return { success: true, message: result.message };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return (
    <GuildDataContext.Provider
      value={{
        activeMode,
        setActiveMode,
        guildInfo,
        glory,
        squads,
        players,
        noSquadPlayers,
        notices,
        allNotices,
        auditLogs,
        stats,
        isLoading,
        refreshData,
        isAuthenticated,
        token,
        adminName,
        login,
        logout,
        addPlayer,
        updatePlayer,
        deletePlayer,
        movePlayerSquad,
        updatePlayerWarPoints,
        updatePlayerActivity,
        updateGlory,
        updateSquad,
        createNotice,
        updateNotice,
        deleteNotice,
        refreshAuditLogs,
      }}
    >
      {children}
    </GuildDataContext.Provider>
  );
};

export const useGuildData = () => {
  const context = useContext(GuildDataContext);
  if (!context) {
    const defaultStats: GuildStats = {
      totalPlayers: 0,
      maxGuildSlots: 55,
      occupiedSlotsStr: '0 / 55',
      squadSlotsOccupied: 0,
      maxSquadSlots: 40,
      noSquadCount: 0,
      activePlayers: 0,
      inactivePlayers: 0,
      onLeavePlayers: 0,
      totalWarPoints: 0,
      currentGlory: GUILD_DATA.glory,
    };

    return {
      activeMode: 'notice' as MainMode,
      setActiveMode: () => {},
      guildInfo: GUILD_DATA,
      glory: GUILD_DATA.glory,
      squads: INITIAL_SQUADS,
      players: INITIAL_PLAYERS,
      noSquadPlayers: [],
      notices: INITIAL_NOTICES,
      allNotices: INITIAL_NOTICES,
      auditLogs: [],
      stats: defaultStats,
      isLoading: false,
      refreshData: async () => {},
      isAuthenticated: false,
      token: null,
      adminName: 'Admin',
      login: async () => ({ success: false, error: 'Context not ready' }),
      logout: async () => {},
      addPlayer: async () => ({ success: false, error: 'Context not ready' }),
      updatePlayer: async () => ({ success: false, error: 'Context not ready' }),
      deletePlayer: async () => ({ success: false, error: 'Context not ready' }),
      movePlayerSquad: async () => ({ success: false, error: 'Context not ready' }),
      updatePlayerWarPoints: async () => ({ success: false, error: 'Context not ready' }),
      updatePlayerActivity: async () => ({ success: false, error: 'Context not ready' }),
      updateGlory: async () => ({ success: false, error: 'Context not ready' }),
      updateSquad: async () => ({ success: false, error: 'Context not ready' }),
      createNotice: async () => ({ success: false, error: 'Context not ready' }),
      updateNotice: async () => ({ success: false, error: 'Context not ready' }),
      deleteNotice: async () => ({ success: false, error: 'Context not ready' }),
      refreshAuditLogs: async () => {},
    };
  }
  return context;
};
