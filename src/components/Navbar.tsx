import React, { useState } from 'react';
import {
  Bell,
  Users,
  Lock,
  Unlock,
  Shield,
  Copy,
  Check,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { ASSETS, GUILD_DATA } from '../data/guildData';
import { useGuildData } from '../context/GuildDataContext';
import { playClickSfx, playSuccessSfx } from '../utils/audioSynth';
import { MainMode } from '../types';

export const Navbar: React.FC = () => {
  const { activeMode, setActiveMode, isAuthenticated, adminName, guildInfo, stats } = useGuildData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyUid = () => {
    navigator.clipboard.writeText(guildInfo.uid);
    setCopied(true);
    playSuccessSfx();
    setTimeout(() => setCopied(false), 2500);
  };

  const modes: { id: MainMode; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'notice', label: 'Notice Mode', icon: Bell },
    { id: 'squad', label: 'Squad Mode', icon: Users, badge: '8 SQUADS' },
    {
      id: 'admin',
      label: 'Admin Mode',
      icon: isAuthenticated ? Unlock : Lock,
      badge: isAuthenticated ? 'VERIFIED' : 'RESTRICTED',
    },
  ];

  return (
    <header className="sticky top-0 z-50 iphone-glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Brand Identity */}
          <div
            onClick={() => {
              playClickSfx();
              setActiveMode('notice');
            }}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="relative w-11 h-11 rounded-2xl p-0.5 bg-gradient-to-br from-blue-500 via-cyan-400 to-blue-700 shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <img
                src={ASSETS.logo}
                alt="EGO EMPIRE Crest"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-[14px] bg-[#070e20]"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Orbitron'] text-lg sm:text-xl font-black text-white tracking-wider">
                  ᎬᏀᎧ <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Ꭼᴍᴘɪꤪꤨʀᴇ</span>
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-blue-500/20 text-cyan-300 border border-blue-400/30">
                  LVL 7
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-white/5 text-gray-300 border border-white/10 hidden sm:inline-block">
                  {stats?.occupiedSlotsStr || `${stats?.totalPlayers ?? 0} / 55`}
                </span>
              </div>
              <p className="font-['Rajdhani'] text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                FREE FIRE ESPORTS GUILD
              </p>
            </div>
          </div>

          {/* THE 3 MAIN MODES — iPhone Glass Segmented Controller (Desktop) */}
          <nav className="hidden md:flex items-center p-1.5 rounded-2xl iphone-glass border border-white/10 shadow-lg">
            {modes.map((mode) => {
              const Icon = mode.icon;
              const isActive = activeMode === mode.id;

              return (
                <button
                  key={mode.id}
                  onClick={() => {
                    playClickSfx();
                    setActiveMode(mode.id);
                  }}
                  className={`relative px-4 py-2.5 rounded-xl text-xs font-['Orbitron'] font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'text-white bg-gradient-to-r from-blue-600 to-blue-500 shadow-md shadow-blue-500/30 font-black border border-white/20 scale-102'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-300' : 'text-gray-400'}`} />
                  <span>{mode.label}</span>
                  {mode.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                        isActive
                          ? 'bg-black/30 text-white'
                          : mode.id === 'admin' && isAuthenticated
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-white/5 text-gray-400'
                      }`}
                    >
                      {mode.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Actions: Copy UID */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <button
              onClick={handleCopyUid}
              className="px-3.5 py-2 rounded-xl iphone-glass hover:border-cyan-400/50 text-xs font-mono text-gray-300 hover:text-white transition-all flex items-center gap-2 cursor-pointer group"
              title="Copy Free Fire Guild UID"
            >
              <span className="text-gray-500 text-[10px]">UID:</span>
              <span className="font-bold text-white group-hover:text-cyan-300">{guildInfo.uid}</span>
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-gray-400 group-hover:text-cyan-400" />
              )}
            </button>

            <a
              href={guildInfo.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-['Orbitron'] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>FACEBOOK</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={handleCopyUid}
              className="p-2 rounded-xl iphone-glass text-xs font-mono text-cyan-300"
              title="Copy UID"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                playClickSfx();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className="p-2.5 rounded-xl iphone-glass text-gray-300 hover:text-white cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (iPhone Glass Style) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 iphone-glass px-4 pt-3 pb-6 space-y-2 animate-fade-in">
          <div className="text-[10px] font-['Orbitron'] uppercase text-gray-400 font-bold px-2 py-1">
            SELECT MODE
          </div>

          {modes.map((mode) => {
            const Icon = mode.icon;
            const isActive = activeMode === mode.id;

            return (
              <button
                key={mode.id}
                onClick={() => {
                  playClickSfx();
                  setActiveMode(mode.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full px-4 py-3 rounded-xl text-left font-['Orbitron'] text-xs font-bold uppercase tracking-wider flex items-center justify-between cursor-pointer ${
                  isActive
                    ? 'text-white bg-blue-600 shadow-md shadow-blue-600/40 font-black'
                    : 'text-gray-300 hover:text-white bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{mode.label}</span>
                </div>
                {mode.badge && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-mono bg-black/30">
                    {mode.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-gray-400 px-2">
            <span>Free Fire Guild UID:</span>
            <span className="text-white font-bold">{guildInfo.uid}</span>
          </div>
        </div>
      )}
    </header>
  );
};
