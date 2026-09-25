// CONDOHUB — APP LAYOUT PRINCIPAL

import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { create } from 'zustand';
import storage from '../../lib/storage';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

// ─── DARK MODE HOOK & STORE ───────────────────────────────────────────────────
interface DarkModeState {
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;
}

export const useDarkMode = create<DarkModeState>((set, get) => {
  const initial = storage.get<boolean>('darkMode') || false;
  if (typeof document !== 'undefined' && initial) {
    document.body.classList.add('dark-mode');
  }
  return {
    darkMode: initial,
    toggleDarkMode: () => {
      const next = !get().darkMode;
      storage.set('darkMode', next);
      if (next) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
      set({ darkMode: next });
    },
    setDarkMode: (value: boolean) => {
      storage.set('darkMode', value);
      if (value) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
      set({ darkMode: value });
    },
  };
});

// ─── COMPONENTE APP LAYOUT ────────────────────────────────────────────────────
export function AppLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { darkMode } = useDarkMode();

  // Sincroniza a classe dark-mode no body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  return (
    <div id="app" style={{ minHeight: '100vh', height: '100vh', display: 'flex', position: 'relative', overflow: 'hidden' }}>
      {/* Sidebar de navegação */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Overlay mobile para fechar a sidebar */}
      {isSidebarOpen && (
        <div
          className="sidebar-mobile-overlay"
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
            zIndex: 35,
          }}
          aria-hidden="true"
        />
      )}

      {/* Wrapper principal: Header fixo + Conteúdo rolável */}
      <div id="main-wrapper" style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <Header onToggleSidebar={() => setSidebarOpen(prev => !prev)} />
        <main id="content-area" style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
