import React from 'react';
import { ArrowUp, Copy, Check, ExternalLink, Shield, ThumbsUp, Bell, Users, Lock } from 'lucide-react';
import { ASSETS, GUILD_DATA } from '../data/guildData';
import { useGuildData } from '../context/GuildDataContext';
import { playClickSfx, playSuccessSfx } from '../utils/audioSynth';

export const Footer: React.FC = () => {
  const { stats, guildInfo, setActiveMode } = useGuildData();
  const [copied, setCopied] = React.useState(false);

  const handleCopyUid = () => {
    navigator.clipboard.writeText(guildInfo.uid);
    setCopied(true);
    playSuccessSfx();
    setTimeout(() => setCopied(false), 2500);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative mt-20 border-t border-white/10 iphone-glass pt-14 pb-10 text-gray-400 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-10 border-b border-white/10">
          {/* Brand Info */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl p-0.5 bg-gradient-to-br from-blue-500 via-cyan-400 to-blue-700 shadow-lg">
                <img
                  src={ASSETS.logo}
                  alt="EGO EMPIRE Crest"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-[14px] bg-[#070e20]"
                />
              </div>
              <div>
                <h3 className="font-['Orbitron'] text-xl font-black text-white tracking-wider">
                  ᎬᏀᎧ <span className="text-cyan-400">Ꭼᴍᴘɪꤪꤨʀᴇ</span>
                </h3>
                <p className="font-['Rajdhani'] text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
                  Free Fire Esports Guild
                </p>
              </div>
            </div>

            <p className="font-sans text-sm text-gray-400 leading-relaxed max-w-md">
              A premier competitive Free Fire esports organization structured into 8 elite tactical divisions. Built for Competition. Driven by Brotherhood.
            </p>

            <div className="inline-flex items-center gap-3 p-2.5 rounded-xl iphone-glass-pill text-xs font-mono">
              <span className="text-gray-400">Guild UID:</span>
              <span className="text-white font-bold tracking-wider">{guildInfo.uid}</span>
              <button
                onClick={handleCopyUid}
                className="px-2 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-cyan-300 text-[10px] font-['Orbitron'] font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>
          </div>

          {/* Quick Navigation to 3 Modes */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-['Orbitron'] text-xs uppercase tracking-[0.2em] font-bold text-white mb-4">
              MAIN MODES
            </h4>
            <ul className="space-y-2 text-sm font-['Rajdhani'] font-semibold">
              <li>
                <button
                  onClick={() => {
                    playClickSfx();
                    setActiveMode('notice');
                    scrollToTop();
                  }}
                  className="hover:text-cyan-300 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5 text-blue-400" />
                  <span>Notice Mode (Bulletins)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    playClickSfx();
                    setActiveMode('squad');
                    scrollToTop();
                  }}
                  className="hover:text-cyan-300 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Squad Mode (8 Divisions)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    playClickSfx();
                    setActiveMode('admin');
                    scrollToTop();
                  }}
                  className="hover:text-cyan-300 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin Mode (Command Center)</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Social & Live Telemetry */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="font-['Orbitron'] text-xs uppercase tracking-[0.2em] font-bold text-white mb-4">
              COMMUNITY & TELEMETRY
            </h4>

            <a
              href={guildInfo.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1877f2]/20 hover:bg-[#1877f2] text-white font-['Orbitron'] text-xs font-bold uppercase tracking-wider border border-[#1877f2]/50 transition-all cursor-pointer"
            >
              <ThumbsUp className="w-3.5 h-3.5 fill-white" />
              <span>OFFICIAL FACEBOOK PAGE</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <div className="pt-2 text-xs font-mono space-y-1 text-gray-500">
              <div>
                Roster Occupancy: <strong className="text-cyan-400">{stats?.occupiedSlotsStr || `${stats?.totalPlayers ?? 0} / 55`}</strong>
              </div>
              <div>
                Total Guild Glory: <strong className="text-amber-300">{(stats?.currentGlory ?? 971515).toLocaleString()} PTS</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-['Rajdhani'] font-medium text-gray-500">
          <div>
            © {new Date().getFullYear()} EGO EMPIRE. Built for Competition. Driven by Brotherhood.
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors cursor-pointer font-['Orbitron'] text-xs"
          >
            <span>BACK TO TOP</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
