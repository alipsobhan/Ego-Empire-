import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeId, ThemeOption } from '../types';

export const THEMES: Record<ThemeId, ThemeOption> = {
  blue: {
    id: 'blue',
    name: 'Electric Blue (Official)',
    bengaliName: 'ইলেকট্রিক ব্লু (অফিশিয়াল)',
    tagline: 'Official EGO EMPIRE Electric Blue & Deep Navy Theme',
    primary: '#1677FF',
    primaryDeep: '#0d4ebd',
    accent: '#00D9FF',
    bg: '#040914',
    surface: '#071426',
    rgb: '22, 119, 255',
    particles: ['rgba(22, 119, 255, ', 'rgba(0, 217, 255, ', 'rgba(13, 78, 189, ', 'rgba(219, 234, 254, '],
  },
  cyan: {
    id: 'cyan',
    name: 'Cyber Cyan',
    bengaliName: 'সাইবার সায়ান',
    tagline: 'Matches official EGO EMPIRE crown shield logo',
    primary: '#00f0ff',
    primaryDeep: '#0284c7',
    accent: '#38bdf8',
    bg: '#040816',
    surface: '#081026',
    rgb: '0, 240, 255',
    particles: ['rgba(0, 240, 255, ', 'rgba(56, 189, 248, ', 'rgba(14, 165, 233, ', 'rgba(224, 242, 254, '],
  },
  crimson: {
    id: 'crimson',
    name: 'Crimson Dynasty',
    bengaliName: 'ক্রিমসন ডায়নেস্টি',
    tagline: 'High-octane battle blood red esports vibe',
    primary: '#ff1a3c',
    primaryDeep: '#8b001a',
    accent: '#ff4d6a',
    bg: '#07070b',
    surface: '#0e0e16',
    rgb: '255, 26, 60',
    particles: ['rgba(255, 26, 60, ', 'rgba(255, 77, 106, ', 'rgba(200, 16, 46, ', 'rgba(255, 180, 190, '],
  },
  gold: {
    id: 'gold',
    name: 'Imperial Gold',
    bengaliName: 'ইম্পেরিয়াল গোল্ড',
    tagline: 'Grandmaster royal champions gold crown',
    primary: '#fbbf24',
    primaryDeep: '#b45309',
    accent: '#fde68a',
    bg: '#0b0804',
    surface: '#141007',
    rgb: '251, 191, 36',
    particles: ['rgba(251, 191, 36, ', 'rgba(245, 158, 11, ', 'rgba(217, 119, 6, ', 'rgba(254, 240, 138, '],
  },
  emerald: {
    id: 'emerald',
    name: 'Toxic Venom',
    bengaliName: 'টক্সিক ভেনম',
    tagline: 'Aggressive radioactive neon green predator',
    primary: '#10b981',
    primaryDeep: '#047857',
    accent: '#34d399',
    bg: '#030c08',
    surface: '#06170f',
    rgb: '16, 185, 129',
    particles: ['rgba(16, 185, 129, ', 'rgba(52, 211, 153, ', 'rgba(5, 150, 105, ', 'rgba(167, 243, 208, '],
  },
  purple: {
    id: 'purple',
    name: 'Void Amethyst',
    bengaliName: 'ভয়েড অ্যামেথিস্ট',
    tagline: 'Mystic cosmic void violet esports aura',
    primary: '#a855f7',
    primaryDeep: '#6b21a8',
    accent: '#c084fc',
    bg: '#080514',
    surface: '#100b26',
    rgb: '168, 85, 247',
    particles: ['rgba(168, 85, 247, ', 'rgba(192, 132, 252, ', 'rgba(126, 34, 206, ', 'rgba(233, 213, 255, '],
  },
};

interface ThemeContextType {
  currentThemeId: ThemeId;
  currentTheme: ThemeOption;
  setTheme: (id: ThemeId) => void;
  availableThemes: ThemeOption[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'ego_empire_theme_choice';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to 'blue' (Electric Blue & Deep Navy Official Esports Theme)
  const [currentThemeId, setCurrentThemeId] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId;
      if (saved && THEMES[saved]) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'blue';
  });

  const currentTheme = THEMES[currentThemeId] || THEMES.blue;

  const setTheme = (id: ThemeId) => {
    if (THEMES[id]) {
      setCurrentThemeId(id);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, id);
      } catch {
        // ignore
      }
    }
  };

  useEffect(() => {
    // Apply data-theme attribute to document
    const root = document.documentElement;
    root.setAttribute('data-theme', currentThemeId);

    // Update CSS custom properties on root
    root.style.setProperty('--theme-primary', currentTheme.primary);
    root.style.setProperty('--theme-primary-deep', currentTheme.primaryDeep);
    root.style.setProperty('--theme-accent', currentTheme.accent);
    root.style.setProperty('--theme-bg', currentTheme.bg);
    root.style.setProperty('--theme-surface', currentTheme.surface);
    root.style.setProperty('--theme-rgb', currentTheme.rgb);
    root.style.setProperty('--theme-border', `rgba(${currentTheme.rgb}, 0.25)`);
    root.style.setProperty('--theme-glow', `0 0 24px -4px rgba(${currentTheme.rgb}, 0.5)`);
    root.style.setProperty('--theme-glow-lg', `0 0 45px -5px rgba(${currentTheme.rgb}, 0.65)`);
    root.style.setProperty('--theme-glow-sm', `0 0 12px rgba(${currentTheme.rgb}, 0.5)`);

    // Meta theme-color update
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', currentTheme.primary);
    }
  }, [currentThemeId, currentTheme]);

  return (
    <ThemeContext.Provider
      value={{
        currentThemeId,
        currentTheme,
        setTheme,
        availableThemes: Object.values(THEMES),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      currentThemeId: 'blue' as ThemeId,
      currentTheme: THEMES.blue,
      setTheme: () => {},
      availableThemes: Object.values(THEMES),
    };
  }
  return context;
};
