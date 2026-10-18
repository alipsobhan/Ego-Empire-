import React, { useState } from 'react';
import {
  Bell,
  Calendar,
  Pin,
  AlertCircle,
  Clock,
  ChevronRight,
  Shield,
  Plus,
  Users,
  Search,
} from 'lucide-react';
import { useGuildData } from '../context/GuildDataContext';
import { playClickSfx } from '../utils/audioSynth';
import { Notice } from '../types';

export const NoticeMode: React.FC = () => {
  const { notices, setActiveMode, isAuthenticated } = useGuildData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  // Filter notices based on search
  const filteredNotices = notices.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const latestNotice = filteredNotices.length > 0 ? filteredNotices[0] : null;
  const previousNotices = filteredNotices.slice(1);

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Top Welcome & Mode Identity Banner */}
      <div className="relative rounded-3xl p-6 sm:p-10 iphone-glass overflow-hidden border border-white/15">
        {/* Ambient Glows */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full iphone-glass-pill border border-blue-400/30 text-blue-300">
              <Bell className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="font-['Orbitron'] text-xs font-black uppercase tracking-[0.2em]">
                OFFICIAL BULLETIN DISPATCH
              </span>
              <span className="text-gray-500">|</span>
              <span className="font-mono text-xs text-gray-300 font-bold">
                {notices.length} ANNOUNCEMENTS
              </span>
            </div>

            <h1 className="font-['Orbitron'] text-3xl sm:text-5xl font-black text-white tracking-wide uppercase">
              HIGH COMMAND <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500">NOTICES</span>
            </h1>

            <p className="font-['Rajdhani'] text-base sm:text-lg text-gray-300 max-w-2xl font-medium leading-relaxed">
              Real-time competitive tournament orders, scrim schedules, and squad reorganization bulletins directly authorized by EGO EMPIRE executive leadership.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto shrink-0">
            <button
              onClick={() => {
                playClickSfx();
                setActiveMode('squad');
              }}
              className="w-full sm:w-auto px-5 py-3 rounded-xl font-['Orbitron'] text-xs font-black uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Users className="w-4 h-4" />
              <span>EXPLORE 8 SQUADS</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            {isAuthenticated && (
              <button
                onClick={() => {
                  playClickSfx();
                  setActiveMode('admin');
                }}
                className="w-full sm:w-auto px-4 py-3 rounded-xl font-['Orbitron'] text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>POST NOTICE</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search Filter for Bulletins if multiple exist */}
      {notices.length > 1 && (
        <div className="flex items-center justify-between gap-4 max-w-xl mx-auto">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search announcements by keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl iphone-glass-input text-white text-xs font-mono outline-none placeholder-gray-500"
            />
          </div>
        </div>
      )}

      {/* PRIMARY FEATURED LATEST NOTICE */}
      {latestNotice ? (
        <div className="relative rounded-3xl p-6 sm:p-10 iphone-glass-card border border-blue-500/30 shadow-2xl overflow-hidden">
          {/* Top Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/10">
            <div className="flex items-center gap-2.5 flex-wrap">
              {latestNotice.priority === 'Pinned' && (
                <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-['Orbitron'] font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Pin className="w-3.5 h-3.5 fill-blue-300" />
                  PINNED BULLETIN
                </span>
              )}
              {latestNotice.priority === 'Urgent' && (
                <span className="px-3 py-1 rounded-full bg-red-500/20 border border-red-400/40 text-red-300 text-xs font-['Orbitron'] font-black uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  URGENT ACTION REQUIRED
                </span>
              )}
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs font-mono">
                BY: {latestNotice.author || 'EGO EMPIRE High Command'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {latestNotice.createdAt
                  ? new Date(latestNotice.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Recent'}
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="my-6">
            <h2 className="font-['Orbitron'] text-2xl sm:text-3xl font-black text-white tracking-wide leading-tight">
              {latestNotice.title}
            </h2>
          </div>

          {/* Body Content (Multiline support) */}
          <div className="font-['Rajdhani'] text-base sm:text-lg text-gray-200 leading-relaxed whitespace-pre-line bg-black/30 rounded-2xl p-6 border border-white/5 shadow-inner">
            {latestNotice.content}
          </div>

          {/* Footer note */}
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-gray-400 font-['Rajdhani'] font-semibold">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <span>Official EGO EMPIRE Announcement • Verified Directive</span>
            </div>
            <span className="font-mono text-gray-500">Notice ID: {latestNotice.id}</span>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="p-16 rounded-3xl iphone-glass text-center max-w-xl mx-auto flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 shadow-inner">
            <Bell className="w-8 h-8 opacity-40 text-blue-400" />
          </div>
          <div>
            <h3 className="font-['Orbitron'] text-xl font-bold text-white mb-2">
              No announcement available
            </h3>
            <p className="font-['Rajdhani'] text-sm text-gray-400 font-semibold max-w-md">
              There are currently no active public announcements published by High Command. Authorized admins can publish bulletins from Admin Mode.
            </p>
          </div>
          {isAuthenticated && (
            <button
              onClick={() => {
                playClickSfx();
                setActiveMode('admin');
              }}
              className="mt-2 px-5 py-2.5 rounded-xl font-['Orbitron'] text-xs font-black uppercase tracking-wider text-black bg-cyan-400 hover:bg-cyan-300 shadow transition-all cursor-pointer"
            >
              CREATE FIRST ANNOUNCEMENT
            </button>
          )}
        </div>
      )}

      {/* ARCHIVED / PREVIOUS NOTICES (If multiple exist) */}
      {previousNotices.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="font-['Orbitron'] text-base font-black uppercase text-white tracking-wider">
              PREVIOUS BULLETINS ({previousNotices.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {previousNotices.map((notice) => (
              <div
                key={notice.id}
                onClick={() => setSelectedNotice(notice)}
                className="p-5 rounded-2xl iphone-glass-card hover:border-blue-400/40 cursor-pointer transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-gray-400">
                      {notice.author || 'Command'}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">
                      {new Date(notice.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-['Orbitron'] text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                    {notice.title}
                  </h4>
                  <p className="font-['Rajdhani'] text-xs text-gray-400 mt-2 line-clamp-3">
                    {notice.content}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-blue-400 group-hover:text-cyan-300">
                  <span>Read Full Notice</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal for viewing archived notice in full */}
      {selectedNotice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedNotice(null)}
        >
          <div
            className="max-w-2xl w-full iphone-glass rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10 mb-4">
              <div>
                <span className="text-xs font-mono text-cyan-400">
                  {new Date(selectedNotice.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <h3 className="font-['Orbitron'] text-xl font-bold text-white mt-1">
                  {selectedNotice.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedNotice(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="font-['Rajdhani'] text-base text-gray-200 whitespace-pre-line leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
              {selectedNotice.content}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setSelectedNotice(null)}
                className="px-5 py-2 rounded-xl font-['Orbitron'] text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/10 cursor-pointer"
              >
                Close Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
