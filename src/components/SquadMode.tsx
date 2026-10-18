import React, { useState, useMemo } from 'react';
import {
  Crown,
  Trophy,
  Users,
  Search,
  Shield,
  UserCheck,
  UserX,
  Clock,
  Sparkles,
  Award,
  ChevronRight,
  Filter,
  Flame,
} from 'lucide-react';
import { useGuildData } from '../context/GuildDataContext';
import { playClickSfx, playEsportsCardHoverSound } from '../utils/audioSynth';
import { Squad, Player, ActivityStatus } from '../types';

export const SquadMode: React.FC = () => {
  const { squads, players, setActiveMode, isAuthenticated } = useGuildData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSquadFilter, setSelectedSquadFilter] = useState('ALL');

  // Compute squad statistics live from real players data
  const squadDetails = useMemo(() => {
    return squads.map((sq) => {
      const squadPlayers = players.filter((p) => p.squadId === sq.id);
      const totalPoints = squadPlayers.reduce((sum, p) => sum + (p.warPoints || 0), 0);
      const leader = squadPlayers.find((p) => p.isLeader) || squadPlayers[0];
      return {
        ...sq,
        players: squadPlayers,
        totalPoints,
        occupiedCount: squadPlayers.length,
        leaderName: leader ? (leader.inGameName || leader.name) : null,
      };
    });
  }, [squads, players]);

  // Order squads by totalPoints descending for live tournament ranking
  const rankedSquads = useMemo(() => {
    return [...squadDetails].sort((a, b) => b.totalPoints - a.totalPoints);
  }, [squadDetails]);

  // Filter squads for display
  const displaySquads = useMemo(() => {
    let list = squadDetails;

    if (selectedSquadFilter !== 'ALL') {
      list = list.filter((s) => s.id === selectedSquadFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((sq) => {
        const matchesSquad = sq.name ? sq.name.toLowerCase().includes(q) : false;
        const matchesPlayer = sq.players.some(
          (p) =>
            (p?.name && p.name.toLowerCase().includes(q)) ||
            (p?.inGameName && p.inGameName.toLowerCase().includes(q)) ||
            (p?.inGameId && p.inGameId.toLowerCase().includes(q))
        );
        return matchesSquad || matchesPlayer;
      });
    }

    return list;
  }, [squadDetails, selectedSquadFilter, searchQuery]);

  // Activity Status Badge Helper
  const renderActivityBadge = (status: ActivityStatus) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active
          </span>
        );
      case 'Inactive':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Inactive
          </span>
        );
      case 'On Leave':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            On Leave
          </span>
        );
      default:
        return null;
    }
  };

  // Rank Badge Helper
  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-400 to-amber-600 text-black font-['Orbitron'] text-xs font-black shadow-lg shadow-amber-500/30 flex items-center gap-1">
          <Crown className="w-3.5 h-3.5 fill-black" /> #1 RANK
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-slate-300 to-slate-400 text-black font-['Orbitron'] text-xs font-black shadow flex items-center gap-1">
          #2 RANK
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-700 to-amber-900 text-white font-['Orbitron'] text-xs font-black shadow flex items-center gap-1">
          #3 RANK
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-lg bg-white/10 text-gray-300 font-['Orbitron'] text-xs font-bold border border-white/10">
        #{rank} RANK
      </span>
    );
  };

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Top Squad Overview Header */}
      <div className="relative rounded-3xl p-6 sm:p-10 iphone-glass border border-white/15 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full iphone-glass-pill border border-blue-400/30 text-blue-300">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-['Orbitron'] text-xs font-black uppercase tracking-[0.2em]">
                8 TACTICAL DIVISIONS
              </span>
              <span className="text-gray-500">|</span>
              <span className="font-mono text-xs text-cyan-300 font-bold">
                5 SLOTS EACH (40 TOTAL)
              </span>
            </div>

            <h1 className="font-['Orbitron'] text-3xl sm:text-5xl font-black text-white tracking-wide uppercase">
              EGO EMPIRE <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500">SQUADS</span>
            </h1>

            <p className="font-['Rajdhani'] text-base sm:text-lg text-gray-300 max-w-2xl font-medium leading-relaxed">
              Official 8 competitive squads of EGO EMPIRE. Each squad has exactly 5 operative slots. Squad war points and rankings are calculated automatically from real player performance.
            </p>
          </div>

          {/* Quick Admin Shortcut if authenticated */}
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            {isAuthenticated && (
              <button
                onClick={() => {
                  playClickSfx();
                  setActiveMode('admin');
                }}
                className="px-5 py-3 rounded-xl font-['Orbitron'] text-xs font-black uppercase tracking-wider text-black bg-cyan-400 hover:bg-cyan-300 shadow-lg shadow-cyan-400/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>MANAGE PLAYERS & SQUADS</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SQUAD RANKING LEADERBOARD OVERVIEW */}
      <div className="rounded-3xl p-6 sm:p-8 iphone-glass border border-white/10 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-['Orbitron'] text-lg sm:text-xl font-black uppercase text-white tracking-wide">
                SQUAD WAR POINTS STANDINGS
              </h2>
              <p className="font-['Rajdhani'] text-xs sm:text-sm text-gray-400 font-semibold">
                Dynamic live leaderboard ordered by total squad war points (highest first)
              </p>
            </div>
          </div>
        </div>

        {/* Squad Leaderboard Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {rankedSquads.map((sq, idx) => (
            <div
              key={sq.id}
              onClick={() => {
                playClickSfx();
                setSelectedSquadFilter(sq.id);
              }}
              className={`p-3.5 rounded-2xl iphone-glass-card border cursor-pointer transition-all flex flex-col justify-between text-center ${
                selectedSquadFilter === sq.id
                  ? 'border-cyan-400 ring-2 ring-cyan-400/30 scale-105'
                  : 'border-white/10 hover:border-white/25'
              }`}
            >
              <div>
                <span
                  className={`inline-block text-[11px] font-['Orbitron'] font-black px-2 py-0.5 rounded-md mb-2 ${
                    idx === 0
                      ? 'bg-amber-400 text-black'
                      : idx === 1
                      ? 'bg-slate-300 text-black'
                      : idx === 2
                      ? 'bg-amber-700 text-white'
                      : 'bg-white/10 text-gray-400'
                  }`}
                >
                  #{idx + 1}
                </span>
                <h4 className="font-['Orbitron'] text-xs font-bold text-white truncate" title={sq.name}>
                  {sq.name}
                </h4>
              </div>

              <div className="mt-3 pt-2 border-t border-white/10">
                <span className="font-['Orbitron'] text-sm font-black text-amber-300 block">
                  {sq.totalPoints} PTS
                </span>
                <span className="text-[10px] font-mono text-gray-400 block mt-0.5">
                  {sq.occupiedCount}/5 Slots
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="p-4 sm:p-5 rounded-2xl iphone-glass border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Squad Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
          <span className="text-xs uppercase font-['Rajdhani'] font-bold text-gray-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-blue-400" /> Filter:
          </span>

          <button
            onClick={() => {
              playClickSfx();
              setSelectedSquadFilter('ALL');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-['Orbitron'] font-bold uppercase transition-all cursor-pointer ${
              selectedSquadFilter === 'ALL'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/40 scale-105 font-black'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5'
            }`}
          >
            All Squads (8)
          </button>

          {squads.map((sq) => (
            <button
              key={sq.id}
              onClick={() => {
                playClickSfx();
                setSelectedSquadFilter(sq.id);
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-['Orbitron'] font-bold uppercase transition-all cursor-pointer ${
                selectedSquadFilter === sq.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/40 scale-105 font-black'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              {sq.badge || sq.name.slice(0, 5)}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search operative or UID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl iphone-glass-input text-white text-xs font-mono outline-none placeholder-gray-500"
          />
        </div>
      </div>

      {/* 8 DEDICATED SQUAD CARDS */}
      <div className="space-y-8">
        {displaySquads.map((squad) => {
          // Current squad ranking in tournament
          const rank = rankedSquads.findIndex((s) => s.id === squad.id) + 1;
          const occupiedCount = squad.players.length;

          // 5 Exact Slots
          const slots = Array.from({ length: 5 }, (_, i) => squad.players[i] || null);

          return (
            <div
              key={squad.id}
              id={`squad-${squad.id}`}
              onMouseEnter={() => playEsportsCardHoverSound()}
              className="relative rounded-3xl p-6 sm:p-8 iphone-glass-card border border-white/15 overflow-hidden transition-all duration-300 group"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div className="flex items-center gap-4">
                  {/* Badge */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600/40 to-cyan-500/20 border border-blue-400/40 flex items-center justify-center font-['Orbitron'] font-black text-blue-300 text-base shadow-lg shadow-blue-500/20 shrink-0">
                    {squad.badge || 'SQ'}
                  </div>

                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-['Orbitron'] text-xl sm:text-2xl font-black text-white tracking-wide">
                        {squad.name}
                      </h3>
                      {getRankBadge(rank)}
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-white/5 border border-white/10 text-cyan-300">
                        {occupiedCount}/5 SLOTS OCCUPIED
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs font-['Rajdhani'] font-semibold text-gray-400">
                      <span>{squad.tagline || 'EGO EMPIRE Tactical Scrim Division'}</span>
                      {squad.leaderName && (
                        <>
                          <span className="text-gray-600">•</span>
                          <span className="text-amber-300 flex items-center gap-1 font-bold">
                            <Crown className="w-3.5 h-3.5 fill-amber-300" /> Leader: {squad.leaderName}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Squad War Points Box */}
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="text-right">
                    <span className="text-[10px] font-['Orbitron'] uppercase tracking-wider text-gray-400 block font-bold">
                      SQUAD WAR POINTS
                    </span>
                    <span className="font-['Orbitron'] text-2xl sm:text-3xl font-black text-amber-300 leading-none">
                      {(squad?.totalPoints ?? 0).toLocaleString()} <span className="text-xs text-amber-400">PTS</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* 5 PLAYER SLOTS (Horizontal or Responsive Grid) */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3 text-xs font-['Orbitron'] uppercase tracking-wider text-gray-400 font-bold">
                  <span>5 OPERATIVE SLOTS</span>
                  <span className="font-mono text-gray-500 text-[11px]">
                    {occupiedCount === 5 ? 'FULL ROSTER (5/5)' : `${5 - occupiedCount} SLOTS AVAILABLE`}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
                  {slots.map((player, slotIndex) => {
                    if (player) {
                      // OCCUPIED SLOT
                      return (
                        <div
                          key={player.id}
                          className="relative rounded-2xl p-4 iphone-glass border border-white/15 hover:border-blue-400/50 transition-all flex flex-col justify-between group/slot bg-[#0a1329]/70"
                        >
                          <div>
                            {/* Slot header */}
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-mono text-gray-500 font-bold">
                                SLOT {slotIndex + 1}
                              </span>
                              {player.isLeader && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[9px] font-['Orbitron'] font-black flex items-center gap-1">
                                  <Crown className="w-2.5 h-2.5 fill-amber-300" /> LEADER
                                </span>
                              )}
                            </div>

                            {/* Player Name */}
                            <h4 className="font-['Orbitron'] text-sm font-black text-white truncate tracking-wide group-hover/slot:text-cyan-300 transition-colors">
                              {player.inGameName}
                            </h4>
                            <p className="text-xs text-gray-400 font-['Rajdhani'] font-medium truncate mt-0.5">
                              {player.name}
                            </p>
                            <span className="text-[10px] font-mono text-gray-500 block mt-0.5">
                              UID: {player.inGameId}
                            </span>
                          </div>

                          {/* Slot Bottom */}
                          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                            {renderActivityBadge(player.activityStatus)}

                            <span className="font-['Orbitron'] text-xs font-black text-amber-300">
                              {player.warPoints} <span className="text-[9px] text-gray-400">PTS</span>
                            </span>
                          </div>
                        </div>
                      );
                    } else {
                      // EMPTY SLOT PLACEHOLDER
                      return (
                        <div
                          key={`empty-${squad.id}-${slotIndex}`}
                          className="rounded-2xl p-4 border border-dashed border-white/15 bg-black/20 flex flex-col items-center justify-center text-center min-h-[140px] text-gray-500 hover:border-white/30 transition-all"
                        >
                          <Users className="w-6 h-6 opacity-30 mb-2 text-gray-400" />
                          <span className="font-['Orbitron'] text-xs font-bold text-gray-400">
                            Empty Slot
                          </span>
                          <span className="text-[10px] font-mono text-gray-600 mt-1">
                            Slot {slotIndex + 1} Available
                          </span>
                          {isAuthenticated && (
                            <button
                              onClick={() => {
                                playClickSfx();
                                setActiveMode('admin');
                              }}
                              className="mt-3 px-3 py-1 rounded-lg text-[10px] font-['Orbitron'] font-bold uppercase text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-colors cursor-pointer"
                            >
                              + Assign
                            </button>
                          )}
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {displaySquads.length === 0 && (
          <div className="p-12 rounded-3xl iphone-glass text-center text-gray-400">
            No squads match your search criteria.
          </div>
        )}
      </div>
    </div>
  );
};
