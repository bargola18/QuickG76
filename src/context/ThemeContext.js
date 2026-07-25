import React, { createContext, useContext, useState } from 'react';

const themes = {
  dark: {
    bg: '#0D1117',
    card: '#161B22',
    border: '#30363D',
    text: '#C9D1D9',
    textSecondary: '#8B949E',
    accent: '#58A6FF',
    green: '#238636',
    red: '#DA3633',
    greenText: '#7EE787',
    inputBg: '#0D1117',
    headerBg: '#161B22',
  },
  light: {
    bg: '#F0F2F5',
    card: '#FFFFFF',
    border: '#D0D7DE',
    text: '#1F2328',
    textSecondary: '#656D76',
    accent: '#0969DA',
    green: '#1F883D',
    red: '#CF222E',
    greenText: '#116329',
    inputBg: '#F6F8FA',
    headerBg: '#FFFFFF',
  },
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const theme = isDark ? themes.dark : themes.light;
  const toggleTheme = () => setIsDark(!isDark);
  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
