/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Navbar } from './components/Navbar';
import { GlassStatsBanner } from './components/GlassStatsBanner';
import { NoticeMode } from './components/NoticeMode';
import { SquadMode } from './components/SquadMode';
import { AdminMode } from './components/AdminMode';
import { Footer } from './components/Footer';
import { ParticleBackground } from './components/ParticleBackground';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GuildDataProvider, useGuildData } from './context/GuildDataContext';
import { ThemeProvider } from './context/ThemeContext';
import { Bell, Users, Lock, Unlock, Shield } from 'lucide-react';
import { playClickSfx } from './utils/audioSynth';

function AppContent() {
  const { activeMode, setActiveMode, isAuthenticated } = useGuildData();

  return (
    <div className="min-h-screen relative text-slate-100 bg-[#040816] overflow-x-hidden selection:bg-blue-500/30 selection:text-white">
      {/* Background Cyber Ambient Particle Effect */}
      <ParticleBackground />

      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[40rem] h-[40rem] rounded-full bg-blue-600/10 blur-[130px]" />
        <div className="absolute top-1/2 -right-40 w-[35rem] h-[35rem] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute -bottom-40 left-1/3 w-[45rem] h-[45rem] rounded-full bg-blue-700/10 blur-[140px]" />
      </div>

      {/* Main iPhone Glass Sticky Navigation Bar */}
      <Navbar />

      {/* Main Page Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 space-y-10 relative z-10">
        {/* HOMEPAGE HERO IDENTITY & LIVE STATS BANNER */}
        <div className="space-y-6">
          {/* Header Title & Mode Tabs Segmented Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full iphone-glass-pill text-blue-300 text-xs font-['Orbitron'] font-bold mb-2">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span>OFFICIAL GUILD COMMAND PORTAL</span>
              </div>
              <h1 className="font-['Orbitron'] text-3xl sm:text-5xl font-black text-white tracking-wider uppercase">
                ᎬᏀᎧ <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500">Ꭼᴍᴘɪꤪꤨʀᴇ</span>
              </h1>
              <p className="font-['Rajdhani'] text-sm sm:text-base text-gray-300 font-semibold max-w-xl mt-1">
                Free Fire Esports Organization • 8 Elite Divisions • Active Glory & Scrim Tracking
              </p>
            </div>

            {/* 3 Main Modes Switcher - iPhone Glass Segmented Pill */}
            <div className="p-1.5 rounded-2xl iphone-glass border border-white/15 flex items-center gap-1.5 shadow-xl w-full sm:w-auto justify-center">
              <button
                onClick={() => {
                  playClickSfx();
                  setActiveMode('notice');
                }}
                className={`px-4 py-2.5 rounded-xl font-['Orbitron'] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  activeMode === 'notice'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40 font-black scale-102 border border-white/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Notice Mode</span>
              </button>

              <button
                onClick={() => {
                  playClickSfx();
                  setActiveMode('squad');
                }}
                className={`px-4 py-2.5 rounded-xl font-['Orbitron'] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  activeMode === 'squad'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40 font-black scale-102 border border-white/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Squad Mode</span>
              </button>

              <button
                onClick={() => {
                  playClickSfx();
                  setActiveMode('admin');
                }}
                className={`px-4 py-2.5 rounded-xl font-['Orbitron'] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  activeMode === 'admin'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40 font-black scale-102 border border-white/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {isAuthenticated ? (
                  <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>Admin Mode</span>
              </button>
            </div>
          </div>

          {/* REAL CALCULATED GUILD STATISTICS BANNER */}
          <GlassStatsBanner />
        </div>

        {/* ACTIVE MODE VIEW CONTAINER */}
        <div className="pt-2">
          {activeMode === 'notice' && <NoticeMode />}
          {activeMode === 'squad' && <SquadMode />}
          {activeMode === 'admin' && <AdminMode />}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <GuildDataProvider>
          <AppContent />
        </GuildDataProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
