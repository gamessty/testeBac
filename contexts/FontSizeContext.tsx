// contexts/fontSizeContext.tsx
'use client';
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';

const COOKIE_NAME = 'fontSizePct';
const OFFSET = 10; // subtract 10% before scaling

type FontSizeContextType = {
  fontSizePct: number;
  setFontSize: (pct: number) => void;
};

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

export const FontSizeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontSizePct, _setFontSizeState] = useState<number>(100);

  const apply = (pct: number) => {
    const scale = Math.max(0, pct - OFFSET) / 100;
    // write CSS var on html
    document.documentElement.style.setProperty('--scale', String(scale));
    // persist choice
    document.cookie = `${COOKIE_NAME}=${pct};path=/;max-age=${60 * 60 * 24 * 365}`;
  };

  useEffect(() => {
    // on mount, read cookie & apply
    const match = document.cookie.match(
      new RegExp('(^| )' + COOKIE_NAME + '=([^;]+)')
    );
    const raw = match ? parseInt(match[2], 10) : 100;
    _setFontSizeState(raw);
    apply(raw);
  }, []);

  const setFontSize = (pct: number) => {
    _setFontSizeState(pct);
    apply(pct);
  };

  return (
    <FontSizeContext.Provider value={{ fontSizePct, setFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
};

export const useFontSize = (): [number, (pct: number) => void] => {
  const ctx = useContext(FontSizeContext);
  if (!ctx) throw new Error('useFontSize must be inside FontSizeProvider');
  return [ctx.fontSizePct, ctx.setFontSize];
};
