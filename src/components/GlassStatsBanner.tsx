import React from 'react';
import {
  Flame,
  Users,
  Shield,
  Activity,
  UserX,
  Trophy,
  Copy,
  Check,
} from 'lucide-react';
import { useGuildData } from '../context/GuildDataContext';
import { playClickSfx, playSuccessSfx } from '../utils/audioSynth';

export const GlassStatsBanner: React.FC = () => {
  const { stats, guildInfo } = useGuildData();
  const [copied, setCopied] = React.useState(false);

  const handleCopyUid = () => {
    navigator.clipboard.writeText(guildInfo.uid);
    setCopied(true);
    playSuccessSfx();
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 animate-fade-in">
      {/* 1. GUILD GLORY */}
      <div className="p-4 rounded-2xl iphone-glass border border-white/10 hover:border-amber-400/40 transition-all flex flex-col justify-between group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-['Orbitron'] font-black uppercase text-gray-400 tracking-wider">
            GUILD GLORY
          </span>
          <Flame className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
        </div>
        <div>
          <span className="font-['Orbitron'] text-xl sm:text-2xl font-black text-amber-300 leading-tight block">
            {(stats?.currentGlory ?? 971515).toLocaleString()}
          </span>
          <span className="text-[10px] font-mono text-gray-500 mt-1 block">Level 7 Max Guild</span>
        </div>
      </div>

      {/* 2. REGISTERED PLAYERS */}
      <div className="p-4 rounded-2xl iphone-glass border border-white/10 hover:border-blue-400/40 transition-all flex flex-col justify-between group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-['Orbitron'] font-black uppercase text-gray-400 tracking-wider">
            REGISTERED ROSTER
          </span>
          <Users className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
        </div>
        <div>
          <span className="font-['Orbitron'] text-xl sm:text-2xl font-black text-white leading-tight block">
            {stats?.occupiedSlotsStr || `${stats?.totalPlayers ?? 0} / 55`}
          </span>
          <span className="text-[10px] font-mono text-gray-500 mt-1 block">Max 55 Operatives</span>
        </div>
      </div>

      {/* 3. OCCUPIED SQUAD SLOTS */}
      <div className="p-4 rounded-2xl iphone-glass border border-white/10 hover:border-blue-400/40 transition-all flex flex-col justify-between group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-['Orbitron'] font-black uppercase text-gray-400 tracking-wider">
            SQUAD DEPLOYMENT
          </span>
          <Shield className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
        </div>
        <div>
          <span className="font-['Orbitron'] text-xl sm:text-2xl font-black text-cyan-300 leading-tight block">
            {stats?.squadSlotsOccupied ?? 0} / 40
          </span>
          <span className="text-[10px] font-mono text-amber-400/80 mt-1 block">
            {stats?.noSquadCount ?? 0} In NO SQUAD
          </span>
        </div>
      </div>

      {/* 4. ACTIVE COMBATANTS */}
      <div className="p-4 rounded-2xl iphone-glass border border-white/10 hover:border-emerald-400/40 transition-all flex flex-col justify-between group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-['Orbitron'] font-black uppercase text-gray-400 tracking-wider">
            ACTIVE PLAYERS
          </span>
          <Activity className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
        </div>
        <div>
          <span className="font-['Orbitron'] text-xl sm:text-2xl font-black text-emerald-400 leading-tight block flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {stats?.activePlayers ?? 0}
          </span>
          <span className="text-[10px] font-mono text-gray-500 mt-1 block">Ready For Battle</span>
        </div>
      </div>

      {/* 5. INACTIVE / ON LEAVE */}
      <div className="p-4 rounded-2xl iphone-glass border border-white/10 hover:border-rose-400/40 transition-all flex flex-col justify-between group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-['Orbitron'] font-black uppercase text-gray-400 tracking-wider">
            INACTIVE / LEAVE
          </span>
          <UserX className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
        </div>
        <div>
          <span className="font-['Orbitron'] text-xl sm:text-2xl font-black text-gray-300 leading-tight block">
            {(stats?.inactivePlayers ?? 0) + (stats?.onLeavePlayers ?? 0)}
          </span>
          <span className="text-[10px] font-mono text-gray-500 mt-1 block">
            {stats?.inactivePlayers ?? 0} Inactive • {stats?.onLeavePlayers ?? 0} Leave
          </span>
        </div>
      </div>

      {/* 6. TOTAL SQUAD WAR POINTS */}
      <div className="p-4 rounded-2xl iphone-glass border border-white/10 hover:border-amber-400/40 transition-all flex flex-col justify-between group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-['Orbitron'] font-black uppercase text-gray-400 tracking-wider">
            TOTAL WAR PTS
          </span>
          <Trophy className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
        </div>
        <div>
          <span className="font-['Orbitron'] text-xl sm:text-2xl font-black text-amber-300 leading-tight block">
            {(stats?.totalWarPoints ?? 0).toLocaleString()}
          </span>
          <span className="text-[10px] font-mono text-gray-500 mt-1 block">Roster Score Sum</span>
        </div>
      </div>
    </div>
  );
};
