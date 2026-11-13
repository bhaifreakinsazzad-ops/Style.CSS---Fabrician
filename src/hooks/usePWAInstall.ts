import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

let sharedDeferredPrompt: BeforeInstallPromptEvent | null = null;
let sharedIsInstalled = false;
const promptSubscribers = new Set<(e: BeforeInstallPromptEvent | null) => void>();
const installedSubscribers = new Set<(installed: boolean) => void>();

function checkStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

if (typeof window !== 'undefined') {
  sharedIsInstalled = checkStandaloneDisplay();

  window.addEventListener('beforeinstallprompt', (e: BeforeInstallPromptEvent) => {
    e.preventDefault();
    sharedDeferredPrompt = e;
    promptSubscribers.forEach((cb) => cb(e));
  });

  window.addEventListener('appinstalled', () => {
    sharedIsInstalled = true;
    sharedDeferredPrompt = null;
    promptSubscribers.forEach((cb) => cb(null));
    installedSubscribers.forEach((cb) => cb(true));
  });
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    () => sharedDeferredPrompt
  );
  const [isInstalled, setIsInstalled] = useState<boolean>(
    () => sharedIsInstalled || checkStandaloneDisplay()
  );
  const [isIOS, setIsIOS] = useState<boolean>(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent;
    const isAppleTouch = /iPad|iPhone|iPod/.test(userAgent);
    const isMacTouch = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
    setIsIOS((isAppleTouch || isMacTouch) && !('MSStream' in window));

    setDeferredPrompt(sharedDeferredPrompt);
    setIsInstalled(sharedIsInstalled || checkStandaloneDisplay());

    promptSubscribers.add(setDeferredPrompt);
    installedSubscribers.add(setIsInstalled);

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        sharedIsInstalled = true;
        setIsInstalled(true);
      }
    };
    mediaQuery.addEventListener('change', handleDisplayChange);

    return () => {
      promptSubscribers.delete(setDeferredPrompt);
      installedSubscribers.delete(setIsInstalled);
      mediaQuery.removeEventListener('change', handleDisplayChange);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    const activePrompt = deferredPrompt || sharedDeferredPrompt;
    if (!activePrompt) return 'unavailable';
    try {
      await activePrompt.prompt();
      const { outcome } = await activePrompt.userChoice;
      if (outcome === 'accepted') {
        sharedIsInstalled = true;
        setIsInstalled(true);
        installedSubscribers.forEach((cb) => cb(true));
      }
      return outcome;
    } catch {
      return 'unavailable';
    } finally {
      // Chromium consumes a BeforeInstallPromptEvent once prompt() is invoked
      sharedDeferredPrompt = null;
      setDeferredPrompt(null);
      promptSubscribers.forEach((cb) => cb(null));
    }
  }, [deferredPrompt]);

  return {
    canPromptInstall: Boolean(deferredPrompt),
    isInstalled,
    isIOS,
    promptInstall,
  };
}
