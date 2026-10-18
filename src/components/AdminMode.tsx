import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  KeyRound,
  Shield,
  Users,
  UserPlus,
  Edit,
  Trash2,
  Trophy,
  Flame,
  Activity,
  Bell,
  FileText,
  AlertTriangle,
  CheckCircle,
  Plus,
  Minus,
  RefreshCw,
  Search,
  LogOut,
  X,
  Upload,
  Crown,
  History,
} from 'lucide-react';
import { useGuildData } from '../context/GuildDataContext';
import { playClickSfx, playSuccessSfx } from '../utils/audioSynth';
import { Player, Squad, Notice, ActivityStatus } from '../types';

type AdminTab = 'members' | 'warPoints' | 'glory' | 'activity' | 'squads' | 'notices' | 'audit';

export const AdminMode: React.FC = () => {
  const {
    isAuthenticated,
    adminName,
    login,
    logout,
    squads,
    players,
    glory,
    allNotices,
    auditLogs,
    addPlayer,
    updatePlayer,
    deletePlayer,
    updatePlayerWarPoints,
    updatePlayerActivity,
    updateGlory,
    updateSquad,
    createNotice,
    updateNotice,
    deleteNotice,
    refreshData,
    refreshAuditLogs,
  } = useGuildData();

  // Authentication State
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Active Admin Sub-tab
  const [activeTab, setActiveTab] = useState<AdminTab>('members');

  // Notifications / Feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    if (type === 'success') playSuccessSfx();
    setTimeout(() => setFeedback(null), 4500);
  };

  // Member Form State (Add / Edit)
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [playerIgn, setPlayerIgn] = useState('');
  const [playerUid, setPlayerUid] = useState('');
  const [playerSquadId, setPlayerSquadId] = useState(squads[0]?.id || 'sq-1');
  const [playerWarPoints, setPlayerWarPoints] = useState<number>(0);
  const [playerStatus, setPlayerStatus] = useState<ActivityStatus>('Active');
  const [playerIsLeader, setPlayerIsLeader] = useState(false);
  const [playerRole, setPlayerRole] = useState('Rusher / Entry');
  const [playerPhoto, setPlayerPhoto] = useState('');

  // Delete Confirmation Modal
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'player' | 'notice';
    id: string;
    title: string;
  } | null>(null);

  // War Point Quick Form State
  const [selectedPlayerForPoints, setSelectedPlayerForPoints] = useState<string>('');
  const [pointAmount, setPointAmount] = useState<number>(50);

  // Glory Quick Form State
  const [gloryAmount, setGloryAmount] = useState<number>(1000);
  const [glorySetAmount, setGlorySetAmount] = useState<number>(glory);

  // Notice Form State
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticePriority, setNoticePriority] = useState<'Normal' | 'Urgent' | 'Pinned'>('Normal');
  const [noticePublished, setNoticePublished] = useState(true);

  // Squad Edit State
  const [editingSquad, setEditingSquad] = useState<Squad | null>(null);
  const [squadNameInput, setSquadNameInput] = useState('');
  const [squadTaglineInput, setSquadTaglineInput] = useState('');

  // Search filter for member list
  const [memberSearch, setMemberSearch] = useState('');

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    const res = await login(passwordInput, nameInput || 'High Command Admin');
    setAuthLoading(false);

    if (res.success) {
      setPasswordInput('');
      playSuccessSfx();
      showFeedback('success', 'Admin access authenticated. Welcome Commander!');
    } else {
      setAuthError(res.error || 'Invalid password. Hint: 1122');
    }
  };

  const handleOpenAddPlayer = () => {
    setEditingPlayer(null);
    setPlayerName('');
    setPlayerIgn('');
    setPlayerUid('');
    setPlayerSquadId(squads[0]?.id || 'sq-1');
    setPlayerWarPoints(0);
    setPlayerStatus('Active');
    setPlayerIsLeader(false);
    setPlayerRole('Rusher / Entry');
    setPlayerPhoto('');
    setIsPlayerModalOpen(true);
  };

  const handleOpenEditPlayer = (p: Player) => {
    setEditingPlayer(p);
    setPlayerName(p.name);
    setPlayerIgn(p.inGameName);
    setPlayerUid(p.inGameId);
    setPlayerSquadId(p.squadId);
    setPlayerWarPoints(p.warPoints);
    setPlayerStatus(p.activityStatus);
    setPlayerIsLeader(Boolean(p.isLeader));
    setPlayerRole(p.role || 'Rusher / Entry');
    setPlayerPhoto(p.photo || '');
    setIsPlayerModalOpen(true);
  };

  const handleSavePlayer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!playerName.trim() || !playerIgn.trim()) {
      showFeedback('error', 'Please enter player real name and in-game name.');
      return;
    }

    if (editingPlayer) {
      // Edit
      const res = await updatePlayer(editingPlayer.id, {
        name: playerName.trim(),
        inGameName: playerIgn.trim(),
        inGameId: playerUid.trim() || editingPlayer.inGameId,
        squadId: playerSquadId,
        warPoints: Number(playerWarPoints),
        activityStatus: playerStatus,
        isLeader: playerIsLeader,
        role: playerRole,
        photo: playerPhoto,
      });

      if (res.success) {
        setIsPlayerModalOpen(false);
        showFeedback('success', `Operative ${playerIgn} updated successfully.`);
      } else {
        showFeedback('error', res.error || 'Failed to update player.');
      }
    } else {
      // Add
      const res = await addPlayer({
        name: playerName.trim(),
        inGameName: playerIgn.trim(),
        inGameId: playerUid.trim(),
        squadId: playerSquadId,
        warPoints: Number(playerWarPoints) || 0,
        activityStatus: playerStatus,
        isLeader: playerIsLeader,
        role: playerRole,
        photo: playerPhoto,
      });

      if (res.success) {
        setIsPlayerModalOpen(false);
        showFeedback('success', `Operative ${playerIgn} enlisted successfully.`);
      } else {
        showFeedback('error', res.error || 'Failed to add player.');
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;

    if (deleteConfirm.type === 'player') {
      const res = await deletePlayer(deleteConfirm.id);
      if (res.success) {
        const msg = (res as { message?: string }).message || 'Player deleted.';
        showFeedback('success', msg);
      } else {
        showFeedback('error', res.error || 'Failed to delete player.');
      }
    } else if (deleteConfirm.type === 'notice') {
      const res = await deleteNotice(deleteConfirm.id);
      if (res.success) {
        showFeedback('success', 'Notice announcement removed.');
      } else {
        showFeedback('error', res.error || 'Failed to remove notice.');
      }
    }
    setDeleteConfirm(null);
  };

  // War Point Adjustment Handlers
  const handleWarPointAction = async (mode: 'add' | 'reduce' | 'set') => {
    if (!selectedPlayerForPoints) {
      showFeedback('error', 'Please select a player first.');
      return;
    }
    const res = await updatePlayerWarPoints(selectedPlayerForPoints, mode, Number(pointAmount));
    if (res.success) {
      const msg = (res as { message?: string }).message || 'War points updated.';
      showFeedback('success', msg);
    } else {
      showFeedback('error', res.error || 'Failed to update war points.');
    }
  };

  // Glory Adjustment Handlers
  const handleGloryAction = async (mode: 'add' | 'reduce') => {
    const res = await updateGlory(mode, Number(gloryAmount));
    if (res.success) {
      const msg = (res as { message?: string }).message || 'Guild glory updated.';
      showFeedback('success', msg);
    } else {
      showFeedback('error', res.error || 'Failed to update glory.');
    }
  };

  const handleGlorySet = async () => {
    const res = await updateGlory('set', Number(glorySetAmount));
    if (res.success) {
      const msg = (res as { message?: string }).message || 'Guild glory set.';
      showFeedback('success', msg);
    } else {
      showFeedback('error', res.error || 'Failed to set glory.');
    }
  };

  // Notice Form Handlers
  const handleOpenAddNotice = () => {
    setEditingNotice(null);
    setNoticeTitle('');
    setNoticeContent('');
    setNoticePriority('Normal');
    setNoticePublished(true);
    setIsNoticeModalOpen(true);
  };

  const handleOpenEditNotice = (n: Notice) => {
    setEditingNotice(n);
    setNoticeTitle(n.title);
    setNoticeContent(n.content);
    setNoticePriority(n.priority || 'Normal');
    setNoticePublished(n.published);
    setIsNoticeModalOpen(true);
  };

  const handleSaveNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim()) {
      showFeedback('error', 'Please provide both notice title and content.');
      return;
    }

    if (editingNotice) {
      const res = await updateNotice(editingNotice.id, {
        title: noticeTitle.trim(),
        content: noticeContent.trim(),
        priority: noticePriority,
        published: noticePublished,
      });
      if (res.success) {
        setIsNoticeModalOpen(false);
        showFeedback('success', 'Notice updated successfully.');
      } else {
        showFeedback('error', res.error || 'Failed to update notice.');
      }
    } else {
      const res = await createNotice({
        title: noticeTitle.trim(),
        content: noticeContent.trim(),
        priority: noticePriority,
        published: noticePublished,
      });
      if (res.success) {
        setIsNoticeModalOpen(false);
        showFeedback('success', 'Notice published successfully.');
      } else {
        showFeedback('error', res.error || 'Failed to publish notice.');
      }
    }
  };

  // Squad Save Handler
  const handleSaveSquad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSquad) return;

    const res = await updateSquad(editingSquad.id, {
      name: squadNameInput.trim() || editingSquad.name,
      tagline: squadTaglineInput.trim(),
    });

    if (res.success) {
      setEditingSquad(null);
      showFeedback('success', 'Squad name and details updated.');
    } else {
      showFeedback('error', res.error || 'Failed to update squad.');
    }
  };

  // ==========================================================================
  // UNVERIFIED SCREEN: SECURE PASSWORD ENTRY GATE (PASSWORD: 1122)
  // ==========================================================================
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 animate-fade-in">
        <div className="relative rounded-3xl p-8 iphone-glass border border-white/20 shadow-2xl text-center">
          {/* Glowing Top Shield */}
          <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-600/20 border border-blue-400/40 flex items-center justify-center text-blue-400 shadow-xl shadow-blue-500/20 mb-6">
            <Lock className="w-10 h-10 animate-pulse" />
          </div>

          <h2 className="font-['Orbitron'] text-2xl font-black text-white uppercase tracking-wider mb-2">
            ADMIN VERIFICATION
          </h2>
          <p className="font-['Rajdhani'] text-sm text-gray-300 font-medium mb-6">
            Enter the authorized administrator passkey to access member controls, war point management, and notice publishing.
          </p>

          {authError && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-mono flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-['Orbitron'] uppercase text-gray-300 font-bold mb-1.5">
                Admin Call-Sign / Name
              </label>
              <input
                type="text"
                placeholder="e.g. Commander Saim / Rabby / Alif"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl iphone-glass-input text-white text-sm outline-none font-mono placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-xs font-['Orbitron'] uppercase text-gray-300 font-bold mb-1.5 flex items-center justify-between">
                <span>Passkey Password *</span>
                <span className="text-[10px] text-cyan-400 font-mono">CODE: 1122</span>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  required
                  placeholder="Enter Passkey (1122)"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl iphone-glass-input text-white text-sm outline-none font-mono placeholder-gray-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full mt-2 py-3.5 rounded-xl font-['Orbitron'] text-xs font-black uppercase tracking-wider text-black bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 hover:opacity-95 shadow-lg shadow-cyan-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {authLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>VERIFYING...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>UNLOCK COMMAND CENTER</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/10 text-[11px] font-mono text-gray-500">
            Protected by Server-Side Session Cryptography • EGO EMPIRE
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // AUTHENTICATED: FULL ADMIN COMMAND CENTER
  // ==========================================================================
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Toast Feedback Notification */}
      {feedback && (
        <div
          className={`fixed top-24 right-4 z-50 p-4 rounded-2xl iphone-glass border shadow-2xl flex items-center gap-3 text-xs font-mono animate-bounce ${
            feedback.type === 'success'
              ? 'border-emerald-400 text-emerald-300 bg-emerald-950/80'
              : 'border-red-400 text-red-300 bg-red-950/80'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Admin Top Dashboard Bar */}
      <div className="rounded-3xl p-6 sm:p-8 iphone-glass border border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-['Orbitron'] text-xl font-black uppercase text-white">
                ADMIN COMMAND CENTER
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <p className="font-['Rajdhani'] text-xs sm:text-sm text-gray-400 font-semibold">
              Commander: <span className="text-white font-bold">{adminName}</span> • Passkey 1122 Verified
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <button
            onClick={() => refreshData()}
            className="p-2.5 rounded-xl iphone-glass border border-white/10 hover:border-white/20 text-gray-300 hover:text-white transition-all cursor-pointer"
            title="Refresh Server Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              playClickSfx();
              logout();
            }}
            className="px-4 py-2.5 rounded-xl font-['Orbitron'] text-xs font-bold uppercase text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>LOGOUT</span>
          </button>
        </div>
      </div>

      {/* Admin Sub-Tabs Navigation (7 Core Sections requested in user brief) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'members', label: 'Member Management', icon: Users, count: players.length },
          { id: 'warPoints', label: 'War Points', icon: Trophy },
          { id: 'glory', label: 'Guild Glory', icon: Flame },
          { id: 'activity', label: 'Activity Status', icon: Activity },
          { id: 'squads', label: 'Squad Divisions', icon: Shield, count: squads.length },
          { id: 'notices', label: 'Notice Board', icon: Bell, count: allNotices.length },
          { id: 'audit', label: 'Audit Log', icon: History, count: auditLogs.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playClickSfx();
                setActiveTab(tab.id as AdminTab);
              }}
              className={`px-4 py-2.5 rounded-xl font-['Orbitron'] text-xs font-bold uppercase tracking-wider shrink-0 transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40 scale-105 font-black border border-white/30'
                  : 'iphone-glass text-gray-400 hover:text-white border border-white/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/40 text-cyan-300 font-mono">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB A: MEMBER MANAGEMENT */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-['Orbitron'] text-lg font-bold text-white">
                GUILD MEMBERS ({players.length}/40)
              </h3>
              <p className="font-['Rajdhani'] text-xs text-gray-400 font-semibold">
                Manage all registered operatives across the 8 squads. Maximum 5 operatives per squad strictly enforced.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter members..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl iphone-glass-input text-white text-xs font-mono outline-none placeholder-gray-500"
                />
              </div>

              <button
                onClick={handleOpenAddPlayer}
                className="px-4 py-2 rounded-xl font-['Orbitron'] text-xs font-black uppercase text-black bg-cyan-400 hover:bg-cyan-300 shadow transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ ADD PLAYER</span>
              </button>
            </div>
          </div>

          {/* Members Table */}
          <div className="rounded-3xl iphone-glass border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[#0b162f] border-b border-white/10 font-['Orbitron'] uppercase tracking-wider text-gray-400 text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Operative</th>
                    <th className="py-3.5 px-4">Free Fire UID</th>
                    <th className="py-3.5 px-4">Squad Division</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">War Points</th>
                    <th className="py-3.5 px-4">Activity</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {players
                    .filter(
                      (p) =>
                        p.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
                        p.inGameName.toLowerCase().includes(memberSearch.toLowerCase()) ||
                        p.inGameId.includes(memberSearch)
                    )
                    .map((player) => {
                      const squad = squads.find((s) => s.id === player.squadId);
                      return (
                        <tr key={player.id} className="hover:bg-white/[0.03] transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-['Orbitron'] font-bold text-white text-sm">
                                {player.inGameName}
                              </span>
                              {player.isLeader && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 text-[9px] font-['Orbitron'] font-bold flex items-center gap-1">
                                  <Crown className="w-2.5 h-2.5 fill-amber-300" /> LEADER
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-400 font-sans block">{player.name}</span>
                          </td>

                          <td className="py-3.5 px-4 text-gray-300">{player.inGameId}</td>

                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-cyan-300 text-xs">
                              {squad?.name || 'Unassigned'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-gray-400 font-sans text-xs">
                            {player.role || 'Rusher'}
                          </td>

                          <td className="py-3.5 px-4 font-['Orbitron'] font-bold text-amber-300">
                            {player.warPoints} PTS
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                player.activityStatus === 'Active'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : player.activityStatus === 'Inactive'
                                  ? 'bg-rose-500/20 text-rose-300'
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              {player.activityStatus}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEditPlayer(player)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-colors cursor-pointer"
                                title="Edit Player"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() =>
                                  setDeleteConfirm({
                                    type: 'player',
                                    id: player.id,
                                    title: `${player.inGameName} (${player.name})`,
                                  })
                                }
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                                title="Delete Player"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                  {players.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400 font-mono">
                        No players registered in the guild roster yet. Click "+ ADD PLAYER" to enlist operatives!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB B: WAR POINT MANAGEMENT */}
      {activeTab === 'warPoints' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-6 rounded-3xl iphone-glass border border-white/10 space-y-4">
            <h3 className="font-['Orbitron'] text-base font-bold text-white uppercase flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Adjust War Points</span>
            </h3>
            <p className="font-['Rajdhani'] text-xs text-gray-400 font-semibold">
              Add, reduce, or set points for an operative. Squad totals and leaderboards update immediately.
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-['Orbitron'] uppercase text-gray-300 font-bold mb-1">
                  Select Player Operative
                </label>
                <select
                  value={selectedPlayerForPoints}
                  onChange={(e) => setSelectedPlayerForPoints(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl iphone-glass-input text-white text-xs font-mono outline-none"
                >
                  <option value="">-- Choose Operative --</option>
                  {players.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.inGameName} ({p.name}) • Current: {p.warPoints} pts
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-['Orbitron'] uppercase text-gray-300 font-bold mb-1">
                  Point Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={pointAmount}
                  onChange={(e) => setPointAmount(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl iphone-glass-input text-white text-xs font-mono outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleWarPointAction('add')}
                  className="px-3 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-['Orbitron'] font-black uppercase flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
                <button
                  type="button"
                  onClick={() => handleWarPointAction('reduce')}
                  className="px-3 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-['Orbitron'] font-black uppercase flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" /> Reduce
                </button>
                <button
                  type="button"
                  onClick={() => handleWarPointAction('set')}
                  className="px-3 py-2.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 text-xs font-['Orbitron'] font-black uppercase flex items-center justify-center gap-1 cursor-pointer"
                >
                  Set Total
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 p-6 rounded-3xl iphone-glass border border-white/10 space-y-4">
            <h3 className="font-['Orbitron'] text-base font-bold text-white uppercase">
              Current Roster Points Snapshot
            </h3>

            <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
              {players.map((p) => {
                const sq = squads.find((s) => s.id === p.squadId);
                return (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl iphone-glass-card flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-['Orbitron'] font-bold text-white block">
                        {p.inGameName}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {sq?.name || 'Unassigned'} • UID: {p.inGameId}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-['Orbitron'] font-black text-amber-300 text-sm">
                        {p.warPoints} PTS
                      </span>
                      <button
                        onClick={() => setSelectedPlayerForPoints(p.id)}
                        className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-[10px] font-mono text-cyan-300 cursor-pointer"
                      >
                        Select
                      </button>
                    </div>
                  </div>
                );
              })}

              {players.length === 0 && (
                <div className="text-center py-8 text-gray-500 font-mono text-xs">
                  No players available to award war points. Add players in Member Management first.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB C: GLORY MANAGEMENT */}
      {activeTab === 'glory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl iphone-glass border border-white/10 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-['Orbitron'] text-lg font-black uppercase text-white">
                  CURRENT GUILD GLORY
                </h3>
                <span className="font-['Orbitron'] text-3xl font-black text-amber-300">
                  {(glory ?? 971515).toLocaleString()} <span className="text-xs text-amber-400">PTS</span>
                </span>
              </div>
            </div>

            <p className="font-['Rajdhani'] text-xs sm:text-sm text-gray-300 font-semibold leading-relaxed">
              Guild glory points represent total Free Fire guild level progression and daily member combat contributions.
            </p>

            <div className="space-y-3 pt-3 border-t border-white/10">
              <label className="block text-xs font-['Orbitron'] uppercase text-gray-300 font-bold mb-1">
                Add or Reduce Glory
              </label>
              <input
                type="number"
                min="1"
                value={gloryAmount}
                onChange={(e) => setGloryAmount(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl iphone-glass-input text-white text-xs font-mono outline-none"
              />

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={() => handleGloryAction('add')}
                  className="py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-['Orbitron'] text-xs font-bold uppercase flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Glory
                </button>
                <button
                  onClick={() => handleGloryAction('reduce')}
                  className="py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-['Orbitron'] text-xs font-bold uppercase flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" /> Reduce Glory
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl iphone-glass border border-white/10 space-y-5">
            <h3 className="font-['Orbitron'] text-base font-bold text-white uppercase">
              Set Exact Glory Total
            </h3>
            <p className="font-['Rajdhani'] text-xs text-gray-400 font-semibold">
              Override and directly set the official Free Fire in-game glory value (e.g. 971,515).
            </p>

            <div className="space-y-3">
              <input
                type="number"
                min="0"
                value={glorySetAmount}
                onChange={(e) => setGlorySetAmount(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl iphone-glass-input text-white text-sm font-mono outline-none"
              />

              <button
                onClick={handleGlorySet}
                className="w-full py-3 rounded-xl font-['Orbitron'] text-xs font-black uppercase text-black bg-amber-400 hover:bg-amber-300 shadow cursor-pointer transition-all"
              >
                APPLY EXACT GLORY
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB D: ACTIVITY MANAGEMENT */}
      {activeTab === 'activity' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl iphone-glass border border-white/10">
            <h3 className="font-['Orbitron'] text-lg font-bold text-white uppercase mb-1">
              OPERATIVE ACTIVITY STATUS CONTROLS
            </h3>
            <p className="font-['Rajdhani'] text-xs sm:text-sm text-gray-400 font-semibold">
              Update any operative's status to Active, Inactive, or On Leave. Status reflects instantly on the public Squad Mode.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-6">
              {players.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl iphone-glass-card border border-white/10 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-['Orbitron'] font-bold text-white text-sm">
                        {p.inGameName}
                      </span>
                      <span className="text-[10px] font-mono text-gray-500">
                        {p.inGameId}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 font-sans">{p.name}</span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                    {(['Active', 'Inactive', 'On Leave'] as ActivityStatus[]).map((st) => (
                      <button
                        key={st}
                        onClick={async () => {
                          const res = await updatePlayerActivity(p.id, st);
                          if (res.success) {
                            showFeedback('success', `${p.inGameName} marked as ${st}`);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold cursor-pointer transition-all ${
                          p.activityStatus === st
                            ? st === 'Active'
                              ? 'bg-emerald-500 text-black font-black'
                              : st === 'Inactive'
                              ? 'bg-rose-500 text-white font-black'
                              : 'bg-amber-400 text-black font-black'
                            : 'bg-white/5 text-gray-400 hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {players.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-500 font-mono text-xs">
                  No players registered. Add players first to configure activity status.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB E: SQUAD MANAGEMENT (View, Rename, Capacity) */}
      {activeTab === 'squads' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-['Orbitron'] text-lg font-bold text-white uppercase">
                THE 8 SQUAD DIVISIONS
              </h3>
              <p className="font-['Rajdhani'] text-xs text-gray-400 font-semibold">
                View slot occupancy and customize division names or tactical call-signs.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {squads.map((sq) => {
              const count = players.filter((p) => p.squadId === sq.id).length;
              return (
                <div
                  key={sq.id}
                  className="p-5 rounded-2xl iphone-glass-card border border-white/10 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-8 h-8 rounded-lg bg-blue-500/20 text-cyan-300 font-['Orbitron'] font-black text-xs flex items-center justify-center">
                        {sq.badge || 'SQ'}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                          count >= 5
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {count}/5 SLOTS
                      </span>
                    </div>

                    <h4 className="font-['Orbitron'] text-sm font-black text-white">
                      {sq.name}
                    </h4>
                    <p className="font-['Rajdhani'] text-xs text-gray-400 mt-1 line-clamp-2">
                      {sq.tagline || 'Tactical Scrim Unit'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-gray-500">Max: 5 slots</span>
                    <button
                      onClick={() => {
                        setEditingSquad(sq);
                        setSquadNameInput(sq.name);
                        setSquadTaglineInput(sq.tagline || '');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-cyan-300 text-xs font-['Orbitron'] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit className="w-3 h-3" /> Edit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB F: NOTICE MANAGEMENT */}
      {activeTab === 'notices' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-['Orbitron'] text-lg font-bold text-white uppercase">
                GUILD NOTICE BULLETINS ({allNotices.length})
              </h3>
              <p className="font-['Rajdhani'] text-xs text-gray-400 font-semibold">
                Publish directives, tournament notices, and scrim orders viewable in Notice Mode.
              </p>
            </div>

            <button
              onClick={handleOpenAddNotice}
              className="px-4 py-2 rounded-xl font-['Orbitron'] text-xs font-black uppercase text-black bg-cyan-400 hover:bg-cyan-300 shadow transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>CREATE NOTICE</span>
            </button>
          </div>

          <div className="space-y-3.5">
            {allNotices.map((n) => (
              <div
                key={n.id}
                className="p-5 rounded-2xl iphone-glass-card border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-['Orbitron'] text-base font-bold text-white">
                      {n.title}
                    </h4>
                    {n.priority === 'Pinned' && (
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-mono font-bold">
                        PINNED
                      </span>
                    )}
                    {n.priority === 'Urgent' && (
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 text-[10px] font-mono font-bold">
                        URGENT
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        n.published
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {n.published ? 'PUBLISHED' : 'DRAFT'}
                    </span>
                  </div>

                  <p className="font-['Rajdhani'] text-xs text-gray-300 line-clamp-2 max-w-3xl">
                    {n.content}
                  </p>

                  <div className="text-[10px] font-mono text-gray-500">
                    Published: {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Recent'} • Author: {n.author || 'Admin'}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    onClick={() => handleOpenEditNotice(n)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white cursor-pointer"
                    title="Edit Notice"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() =>
                      setDeleteConfirm({
                        type: 'notice',
                        id: n.id,
                        title: n.title,
                      })
                    }
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer"
                    title="Delete Notice"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {allNotices.length === 0 && (
              <div className="p-12 rounded-2xl iphone-glass text-center text-gray-500 font-mono text-xs">
                No notices published yet. Click "CREATE NOTICE" to publish the first announcement!
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB G: AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="p-6 rounded-3xl iphone-glass border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="font-['Orbitron'] text-base font-bold text-white uppercase flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-400" />
                <span>ADMIN ACTION AUDIT TRAIL</span>
              </h3>
              <p className="font-['Rajdhani'] text-xs text-gray-400 font-semibold">
                Chronological record of administrative operations, player enlisting, and point updates.
              </p>
            </div>
            <button
              onClick={() => refreshAuditLogs()}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 text-xs font-mono flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>

          <div className="max-h-[500px] overflow-y-auto space-y-2 pr-1 divide-y divide-white/5">
            {auditLogs.map((log) => (
              <div key={log.id} className="pt-2.5 pb-2.5 flex items-start justify-between gap-4 text-xs font-mono">
                <div>
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold mr-2">
                    {log.action}
                  </span>
                  <span className="text-gray-200">{log.details}</span>
                </div>
                <div className="text-right text-[10px] text-gray-500 shrink-0">
                  <div>{new Date(log.timestamp).toLocaleTimeString()}</div>
                  <div>By: {log.performedBy}</div>
                </div>
              </div>
            ))}

            {auditLogs.length === 0 && (
              <div className="py-12 text-center text-gray-500 font-mono text-xs">
                No audit log history recorded yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ADD / EDIT PLAYER OPERATIVE */}
      {/* ============================================================== */}
      {isPlayerModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setIsPlayerModalOpen(false)}
        >
          <div
            className="max-w-lg w-full iphone-glass rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <h4 className="font-['Orbitron'] text-base font-black uppercase text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-cyan-400" />
                <span>{editingPlayer ? 'Edit Player Details' : 'Add New Player'}</span>
              </h4>
              <button
                onClick={() => setIsPlayerModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePlayer} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-['Orbitron'] uppercase text-gray-300 font-bold mb-1">
                    Real Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alif Sobhan"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl iphone-glass-input text-white text-xs font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-['Orbitron'] uppercase text-gray-300 font-bold mb-1">
                    In-Game Name (IGN) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EGO・ALIF"
                    value={playerIgn}
                    onChange={(e) => setPlayerIgn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl iphone-glass-input text-white text-xs font-mono outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-['Orbitron'] uppercase text-gray-300 font-bold mb-1">
                    Free Fire UID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 920194821"
                    value={playerUid}
                    onChange={(e) => setPlayerUid(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl iphone-glass-input text-white text-xs font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-['Orbitron'] uppercase text-gray-300 font-bold mb-1">
                    Assign Squad (Max 5) *
                  </label>
                  <select
                    value={playerSquadId}
                    onChange={(e) => setPlayerSquadId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl iphone-glass-input text-white text-xs font-mono outline-none"
                  >
                    {squads.map((sq) => {
                      const count = players.filter((p) => p.squadId === sq.id && p.id !== editingPlayer?.id).length;
                      return (
                        <option key={sq.id} value={sq.id} disabled={count >= 5}>
                          {sq.name} ({count}/5 slots) {count >= 5 ? '- FULL' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-['Orbitron'] uppercase text-gray-300 font-bold mb-1">
                    Combat Role
                  </label>
                  <select
                    value={playerRole}
                    onChange={(e) => setPlayerRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl iphone-glass-input text-white text-xs font-mono outline-none"
                  >
                    <option value="Rusher / Entry">Rusher / Entry</option>
                    <option value="Sniper Ace">Sniper Ace</option>
                    <option value="IGL / Leader">IGL / Leader</option>
                    <option value="Flanker / Support">Flanker / Support</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-['Orbitron'] uppercase text-gray-300 font-bold mb-1">
                    Activity Status
                  </label>
                  <select
                    value={playerStatus}
                    onChange={(e) => setPlayerStatus(e.target.value as ActivityStatus)}
                    className="w-full px-3 py-2 rounded-xl iphone-glass-input text-white text-xs font-mono outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-['Orbitron'] uppercase text-gray-300 font-bold mb-1">
                    Initial War Points
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={playerWarPoints}
                    onChange={(e) => setPlayerWarPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl iphone-glass-input text-white text-xs font-mono outline-none"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-['Orbitron'] text-gray-200">
                    <input
                      type="checkbox"
                      checked={playerIsLeader}
                      onChange={(e) => setPlayerIsLeader(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 outline-none"
                    />
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>Squad Leader Designation</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPlayerModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/15 text-gray-300 text-xs font-['Orbitron'] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-['Orbitron'] text-xs font-black uppercase shadow cursor-pointer transition-all"
                >
                  {editingPlayer ? 'Save Changes' : 'Enlist Operative'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CREATE / EDIT NOTICE */}
      {/* ============================================================== */}
      {isNoticeModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setIsNoticeModalOpen(false)}
        >
          <div
            className="max-w-lg w-full iphone-glass rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <h4 className="font-['Orbitron'] text-base font-black uppercase text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-cyan-400" />
                <span>{editingNotice ? 'Edit Bulletin Notice' : 'Create Guild Notice'}</span>
              </h4>
              <button
                onClick={() => setIsNoticeModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNotice} className="space-y-4">
              <div>
                <label className="block text-[11px] font-['Orbitron'] uppercase text-gray-300 font-bold mb-1">
                  Notice Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scrimmage Tournament Bracket Schedule"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl iphone-glass-input text-white text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-['Orbitron'] uppercase text-gray-300 font-bold mb-1">
                  Notice Body (Multiline Supported) *
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Write announcement details..."
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                  className="w-full p-3 rounded-xl iphone-glass-input text-white text-xs font-sans outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-['Orbitron'] uppercase text-gray-300 font-bold mb-1">
                    Priority Tier
                  </label>
                  <select
                    value={noticePriority}
                    onChange={(e) => setNoticePriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl iphone-glass-input text-white text-xs font-mono outline-none"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Pinned">Pinned (Top of list)</option>
                    <option value="Urgent">Urgent Alert</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-['Orbitron'] text-gray-200">
                    <input
                      type="checkbox"
                      checked={noticePublished}
                      onChange={(e) => setNoticePublished(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 outline-none"
                    />
                    <span>Publish Immediately</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNoticeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/15 text-gray-300 text-xs font-['Orbitron'] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-['Orbitron'] text-xs font-black uppercase shadow cursor-pointer transition-all"
                >
                  {editingNotice ? 'Update Notice' : 'Publish Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: EDIT SQUAD NAME / TAGLINE */}
      {/* ============================================================== */}
      {editingSquad && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setEditingSquad(null)}
        >
          <div
            className="max-w-md w-full iphone-glass rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <h4 className="font-['Orbitron'] text-base font-black uppercase text-white">
                Edit Squad Details
              </h4>
              <button
                onClick={() => setEditingSquad(null)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSquad} className="space-y-4">
              <div>
                <label className="block text-[11px] font-['Orbitron'] uppercase text-gray-300 font-bold mb-1">
                  Squad Name *
                </label>
                <input
                  type="text"
                  required
                  value={squadNameInput}
                  onChange={(e) => setSquadNameInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl iphone-glass-input text-white text-xs font-mono outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-['Orbitron'] uppercase text-gray-300 font-bold mb-1">
                  Squad Tagline / Motto
                </label>
                <input
                  type="text"
                  value={squadTaglineInput}
                  onChange={(e) => setSquadTaglineInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl iphone-glass-input text-white text-xs outline-none"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingSquad(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/15 text-gray-300 text-xs font-['Orbitron'] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-['Orbitron'] text-xs font-black uppercase shadow cursor-pointer transition-all"
                >
                  Save Squad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* CONFIRMATION MODAL BEFORE PERMANENT DELETION */}
      {/* ============================================================== */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="max-w-md w-full iphone-glass rounded-3xl p-6 sm:p-8 border border-red-500/30 shadow-2xl relative text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h4 className="font-['Orbitron'] text-lg font-black uppercase text-white mb-2">
              CONFIRM PERMANENT DELETION
            </h4>

            <p className="font-['Rajdhani'] text-sm text-gray-300 mb-6">
              Are you sure you want to permanently delete{' '}
              <strong className="text-white font-mono">{deleteConfirm.title}</strong>? This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 font-['Orbitron'] text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-['Orbitron'] text-xs font-black uppercase shadow-lg shadow-red-600/40 cursor-pointer"
              >
                PERMANENTLY DELETE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
