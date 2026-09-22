import { useState, useEffect } from 'react';

export function useThemeMode(): boolean {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      return (
        document.body.classList.contains('dark-mode') ||
        localStorage.getItem('condohub_darkmode') === 'true'
      );
    }
    return false;
  });

  useEffect(() => {
    const checkDark = () => {
      const isDarkMode =
        document.body.classList.contains('dark-mode') ||
        localStorage.getItem('condohub_darkmode') === 'true';
      setIsDark(isDarkMode);
    };

    // Observa alterações na classe do body (feitas pelo Header)
    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          checkDark();
        }
      }
    });

    observer.observe(document.body, { attributes: true });

    // Listener para storage caso ocorra em abas
    window.addEventListener('storage', checkDark);

    return () => {
      observer.disconnect();
      window.removeEventListener('storage', checkDark);
    };
  }, []);

  return isDark;
}
