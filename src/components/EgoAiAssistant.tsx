import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, X, Trash2, Volume2, VolumeX, Shield, ChevronDown, MessageSquare } from 'lucide-react';
import { playClickSfx, playHoverSfx } from '../utils/audioSynth';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

const QUICK_QUESTIONS = [
  'What is EGO EMPIRE?',
  'Guild UID?',
  'Guild Level?',
  'Current Glory?',
  'Who are the officers?',
  'What tournaments are available?',
  'How can I join?',
  'Tell me about EGO EMPIRE',
  'Who made this website?',
];

export const EgoAiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Welcome to EGO AI ⚡\nI'm the official AI assistant of EGO EMPIRE.\n\nAsk me anything about the guild, tournaments, officers, website, or Free Fire.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isThinking]);

  // Client-side fallback knowledge engine (Bangla / Banglish / English)
  const getFallbackReply = (query: string): string => {
    const q = query.toLowerCase().trim();
    const isBangla = /[\u0980-\u09FF]/.test(query);
    const isBanglish = /\b(koto|ki|kivabe|ke|kobe|kothay|bhai|bolo|koro|korbo|naam|nam|ache|kemon|keno)\b/i.test(query);

    if (q.includes('developer') || q.includes('who made') || q.includes('creator') || q.includes('banayse') || q.includes('alif') || q.includes('sobhan')) {
      if (isBangla) return "ওয়েবসাইটটি তৈরি করেছেন আলিফ সোবহান (Made By Alif Sobhan)।";
      if (isBanglish) return "Ei website-ti Alif Sobhan (Made By Alif Sobhan) baniyeche.";
      return "This website was Made By Alif Sobhan.";
    }

    if (q.includes('uid') || q.includes('id')) {
      if (isBangla) return "EGO EMPIRE-এর অফিসিয়াল গিল্ড UID হলো: 3072098620 (লেভেল ৭, গ্লোরি ৯৭১,৫১৫)।";
      if (isBanglish) return "EGO EMPIRE er official Guild UID holo: 3072098620 (Level 7, Glory 971,515)।";
      return "The official Guild UID of EGO EMPIRE is 3072098620 (Level 7, Glory 971,515).";
    }

    if (q.includes('level') || (isBangla && q.includes('লেভেল'))) {
      if (isBangla) return "EGO EMPIRE গিল্ডের বর্তমান লেভেল হলো Level 7!";
      if (isBanglish) return "EGO EMPIRE guild er bortoman level holo Level 7!";
      return "EGO EMPIRE is currently at Level 7.";
    }

    if (q.includes('glory') || (isBangla && q.includes('গ্লোরি'))) {
      if (isBangla) return "EGO EMPIRE গিল্ডের বর্তমান গ্লোরি হলো 971,515!";
      if (isBanglish) return "EGO EMPIRE guild er total glory holo 971,515!";
      return "The total glory of EGO EMPIRE is 971,515.";
    }

    if (q.includes('founder') || q.includes('leader') || (isBangla && (q.includes('প্রতিষ্ঠাতা') || q.includes('লিডার')))) {
      if (isBangla) return "EGO EMPIRE-এর প্রতিষ্ঠাতা ও লিডার হলেন Rabby (EGO・BREAK) — Apex Commander!";
      if (isBanglish) return "EGO EMPIRE er Founder & Leader holen Rabby (EGO・BREAK) — Apex Commander!";
      return "The Founder & Leader of EGO EMPIRE is Rabby (EGO・BREAK) — Apex Commander.";
    }

    if (q.includes('officer') || (isBangla && q.includes('অফিসার')) || q.includes('team')) {
      if (isBangla) {
        return "EGO EMPIRE-এর অফিসিয়াল কমান্ড টিম:\n• Rabby (EGO・BREAK) - Founder & Leader\n• Muhammad Saim (EGO・SAIM) - Head Officer\n• Noman Ahamed (EGO・NOMAN) - Officer\n• Alif Sobhan (EGO・ALIF) - Developer & Officer\n• Ayan (EGO・AYAN) - Officer\n• Abu Horira Tonmoy (EGO・TONMOY) - Officer";
      }
      return "The official Officers of EGO EMPIRE are:\n• Rabby (EGO・BREAK) - Founder & Leader\n• Muhammad Saim (EGO・SAIM) - Head Officer\n• Noman Ahamed (EGO・NOMAN) - Officer\n• Alif Sobhan (EGO・ALIF) - Developer & Officer\n• Ayan (EGO・AYAN) - Officer\n• Abu Horira Tonmoy (EGO・TONMOY) - Officer";
    }

    if (q.includes('join') || (isBangla && q.includes('যুক্ত'))) {
      if (isBangla) return "EGO EMPIRE-এ যোগ দিতে ওয়েবসাইটের 'JOIN EGO EMPIRE' বাটন থেকে ট্রায়াল ফর্ম পূরণ করুন অথবা ফেসবুক পেজে যোগাযোগ করুন: https://www.facebook.com/share/1CN8FCDT8J/";
      return "To join EGO EMPIRE, tap the 'JOIN EGO EMPIRE' or 'IN-GAME TRIAL' button on the website to submit your application, or connect via our official Facebook page: https://www.facebook.com/share/1CN8FCDT8J/";
    }

    if (q.includes('tournament') || q.includes('scrim') || (isBangla && q.includes('টুর্নামেন্ট'))) {
      if (isBangla) return "EGO EMPIRE প্রতিদিন রাত ৮:০০ টায় প্র্যাকটিস স্ক্রিমস, সাপ্তাহিক সান ডে শোডাউন এবং মান্থলি এম্পায়ার কাপ আয়োজন করে।";
      return "EGO EMPIRE competes in daily 8:00 PM BST practice scrims, weekly custom showdowns, and monthly Tier-1 Empire Cups with cash prizes!";
    }

    if (q.includes('what is ego') || q.includes('tell me about') || q.includes('ego empire ki')) {
      if (isBangla) return "EGO EMPIRE (ᎬᏀᎧ Ꭼᴍᴘɪꤪꤨʀᴇ) হলো একটি এলিট Free Fire এস্পোর্টস ও গেমিং গিল্ড (লেভেল ৭, গ্লোরি ৯৭১,৫১৫, UID: 3072098620)। আমরা কমপিটিটিভ স্ক্রিমস এবং টুর্নামেন্ট ডমিনেশনে বিশ্বাসী।";
      return "EGO EMPIRE (ᎬᏀᎧ Ꭼᴍᴘɪꤪꤨʀᴇ) is an elite Free Fire esports gaming guild (Level 7, Glory 971,515, UID: 3072098620) dedicated to competitive scrims, championships, and squad brotherhood.";
    }

    if (isBangla) return "আমি EGO EMPIRE-এর অফিসিয়াল এআই অ্যাসিস্ট্যান্ট। গিল্ড UID, লেভেল, গ্লোরি, অফিসার, টুর্নামেন্ট বা Free Fire সম্পর্কিত যেকোনো কিছু আমাকে জিজ্ঞাসা করতে পারেন!";
    if (isBanglish) return "Ami EGO EMPIRE er official AI assistant. Guild UID, Level, Glory, Officers, Tournaments ba Free Fire niye jiggesh korte paren!";
    return "I am EGO AI, the official assistant of EGO EMPIRE! Ask me anything about our guild UID, Level, Glory, Officers, Tournaments, or Free Fire.";
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isThinking) return;

    if (soundEnabled) playClickSfx();

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsThinking(true);

    try {
      // Call secure backend endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-6).map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            text: m.text,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('API server returned an error');
      }

      const data = await response.json();
      const replyText = data.reply || getFallbackReply(text);

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      // Seamless graceful fallback
      const replyText = getFallbackReply(text);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsThinking(false);
      if (soundEnabled) playHoverSfx();
    }
  };

  const handleClearChat = () => {
    if (soundEnabled) playClickSfx();
    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: "Welcome to EGO AI ⚡\nI'm the official AI assistant of EGO EMPIRE.\n\nAsk me anything about the guild, tournaments, officers, website, or Free Fire.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <>
      {/* FLOATING ASSISTANT TRIGGER BUTTON (Bottom-Right) */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center">
        {!isOpen && (
          <button
            id="ego-ai-floating-btn"
            onClick={() => {
              if (soundEnabled) playClickSfx();
              setIsOpen(true);
            }}
            onMouseEnter={() => {
              if (soundEnabled) playHoverSfx();
            }}
            className="group relative flex items-center gap-3 px-4 py-3 rounded-full bg-gradient-to-r from-[#071426] via-[#0b1b36] to-[#071426] border border-[#1677FF]/50 hover:border-[#00D9FF] text-white shadow-[0_8px_30px_rgba(22,119,255,0.35)] hover:shadow-[0_10px_35px_rgba(0,217,255,0.45)] transition-all duration-300 transform hover:-translate-y-1 active:scale-95 cursor-pointer select-none"
            aria-label="Open EGO AI Assistant"
          >
            {/* Energy pulse ring */}
            <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#1677FF]/30 to-[#00D9FF]/30 blur-sm opacity-70 group-hover:opacity-100 animate-pulse" />

            {/* AI Avatar icon container */}
            <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-[#1677FF] to-[#00D9FF] flex items-center justify-center p-[1px] shadow-inner">
              <div className="w-full h-full bg-[#040914] rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-[#00D9FF] group-hover:text-white transition-colors animate-pulse" />
              </div>
              {/* Online indicator dot */}
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#10b981] border-2 border-[#040914] shadow-[0_0_8px_#10b981]" />
            </div>

            {/* Label */}
            <div className="flex flex-col text-left pr-1">
              <div className="flex items-center gap-1.5">
                <span className="font-['Orbitron'] text-xs font-black tracking-wider text-white group-hover:text-[#00D9FF] transition-colors">
                  EGO AI
                </span>
                <Sparkles className="w-3 h-3 text-[#00D9FF]" />
              </div>
              <span className="text-[9px] uppercase tracking-widest text-[#94a3b8] font-['Rajdhani'] font-bold leading-none">
                AI ASSISTANT
              </span>
            </div>
          </button>
        )}
      </div>

      {/* LARGE CHAT PANEL (Esports Dark Glassmorphism) */}
      {isOpen && (
        <div
          id="ego-ai-chat-panel"
          className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] rounded-2xl bg-[#071426]/95 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(22,119,255,0.25)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          {/* Top ambient highlight */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#1677FF] to-[#00D9FF]" />

          {/* HEADER */}
          <div className="px-5 py-3.5 bg-gradient-to-r from-[#0b1d3a] to-[#071426] border-b border-white/10 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#1677FF] to-[#00D9FF] p-[1.5px]">
                <div className="w-full h-full bg-[#040914] rounded-[10px] flex items-center justify-center">
                  <Bot className="w-5 h-5 text-[#00D9FF]" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#10b981] border-2 border-[#040914] shadow-[0_0_8px_#10b981]" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-['Orbitron'] text-sm font-bold tracking-wider text-white">
                    EGO AI
                  </h3>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold font-['Rajdhani'] uppercase tracking-wider bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />
                    ONLINE
                  </span>
                </div>
                <p className="text-[11px] text-[#94a3b8] font-['Rajdhani'] font-medium">
                  Official EGO EMPIRE Assistant
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? 'Mute SFX' : 'Enable SFX'}
                className="p-2 rounded-lg text-[#94a3b8] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-[#00D9FF]" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={handleClearChat}
                title="Clear Chat"
                className="p-2 rounded-lg text-[#94a3b8] hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (soundEnabled) playClickSfx();
                  setIsOpen(false);
                }}
                title="Minimize / Close"
                className="p-2 rounded-lg text-[#94a3b8] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* CHAT MESSAGES BODY */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} transition-all`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[10px] font-['Rajdhani'] uppercase tracking-wider font-bold text-[#64748b]">
                    {msg.sender === 'user' ? 'YOU' : 'EGO AI'}
                  </span>
                  <span className="text-[9px] text-[#475569]">{msg.timestamp}</span>
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-[#1677FF] to-[#0c4cbd] text-white font-medium rounded-tr-sm shadow-[0_4px_15px_rgba(22,119,255,0.35)]'
                      : 'bg-[#091830] text-[#e2e8f0] border border-white/10 rounded-tl-sm shadow-[0_4px_15px_rgba(0,0,0,0.3)]'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* AI THINKING ANIMATION */}
            {isThinking && (
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[10px] font-['Rajdhani'] uppercase tracking-wider font-bold text-[#00D9FF]">
                    EGO AI
                  </span>
                  <span className="text-[9px] text-[#64748b]">ANALYZING...</span>
                </div>
                <div className="bg-[#091830] border border-[#00D9FF]/30 rounded-2xl rounded-tl-sm p-3 flex items-center gap-2 shadow-[0_0_15px_rgba(0,217,255,0.15)]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#00D9FF] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-[#1677FF] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-[#00D9FF] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-[#94a3b8] font-['Rajdhani'] font-semibold tracking-wide">
                    EGO AI is thinking...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* QUICK QUESTIONS CHIPS */}
          <div className="px-3 py-2 bg-[#060f1e]/90 border-t border-white/5 overflow-x-auto no-scrollbar flex items-center gap-1.5">
            <span className="text-[10px] text-[#64748b] font-['Rajdhani'] font-bold uppercase tracking-wider flex-shrink-0 pl-1">
              SUGGESTED:
            </span>
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleSendMessage(q)}
                disabled={isThinking}
                className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-medium font-['Rajdhani'] tracking-wide bg-white/[0.03] hover:bg-[#1677FF]/20 text-[#cbd5e1] hover:text-[#00D9FF] border border-white/10 hover:border-[#1677FF]/50 transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* INPUT FORM */}
          <div className="p-3 bg-[#071426] border-t border-white/10">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="relative flex items-center"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask EGO AI about guild, UID, officers, Free Fire..."
                disabled={isThinking}
                className="w-full bg-[#040914] border border-white/10 focus:border-[#00D9FF] focus:ring-1 focus:ring-[#00D9FF] rounded-xl pl-3.5 pr-12 py-2.5 text-xs sm:text-sm text-white placeholder-[#64748b] outline-none transition-all"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isThinking}
                className="absolute right-1.5 p-2 rounded-lg bg-gradient-to-r from-[#1677FF] to-[#0c4cbd] hover:from-[#2e86ff] hover:to-[#1677FF] text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_12px_rgba(22,119,255,0.4)] transition-all cursor-pointer"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* Disclaimer */}
            <p className="mt-2 text-[10px] text-center text-[#64748b] font-['Rajdhani'] font-semibold">
              EGO AI provides information based on verified guild intelligence.
            </p>
          </div>
        </div>
      )}
    </>
  );
};
