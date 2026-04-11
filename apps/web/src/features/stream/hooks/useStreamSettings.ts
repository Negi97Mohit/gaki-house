import { useState, useEffect, useCallback } from 'react';

export interface StreamSettings {
  selectedPlatforms: string[];
  streamKeys: Record<string, string>;
  customRtmpUrls: Record<string, string>;
  autoReconnect: boolean;
  recordLocally: boolean;
  bitrate: number;
  resolution: '720p' | '1080p' | '1440p' | '4k';
  fps: 30 | 60;
}

interface ElectronWindow {
  electron?: {
    isElectron: boolean;
    storage?: {
      get: (key: string) => Promise<any>;
      set: (key: string, value: any) => Promise<boolean>;
      delete: (key: string) => Promise<boolean>;
    };
  };
}

const STORAGE_KEY = 'stream-settings';

const defaultSettings: StreamSettings = {
  selectedPlatforms: [],
  streamKeys: {},
  customRtmpUrls: {},
  autoReconnect: true,
  recordLocally: false,
  bitrate: 6000,
  resolution: '1080p',
  fps: 30,
};

// Helper to check if we're in Electron
const isElectron = (): boolean => {
  return !!(window as ElectronWindow).electron?.isElectron;
};

// Helper to get storage (electron or localStorage)
const getStoredSettings = async (): Promise<StreamSettings> => {
  try {
    if (isElectron() && (window as ElectronWindow).electron?.storage) {
      const saved = await (window as ElectronWindow).electron!.storage!.get(STORAGE_KEY);
      if (saved) {
        return { ...defaultSettings, ...saved };
      }
    } else {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultSettings, ...parsed };
      }
    }
  } catch (error) {
    console.error('Failed to load stream settings:', error);
  }
  return defaultSettings;
};

// Helper to save settings
const saveSettings = async (settings: StreamSettings): Promise<void> => {
  try {
    if (isElectron() && (window as ElectronWindow).electron?.storage) {
      await (window as ElectronWindow).electron!.storage!.set(STORAGE_KEY, settings);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  } catch (error) {
    console.error('Failed to save stream settings:', error);
  }
};

export function useStreamSettings() {
  const [settings, setSettings] = useState<StreamSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings on mount (async for electron)
  useEffect(() => {
    getStoredSettings().then((loadedSettings) => {
      setSettings(loadedSettings);
      setIsLoaded(true);
    });
  }, []);

  // Save settings whenever they change (after initial load)
  useEffect(() => {
    if (isLoaded) {
      saveSettings(settings);
    }
  }, [settings, isLoaded]);

  const updateSettings = useCallback((updates: Partial<StreamSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const togglePlatform = useCallback((platformId: string) => {
    setSettings(prev => {
      const isSelected = prev.selectedPlatforms.includes(platformId);
      return {
        ...prev,
        selectedPlatforms: isSelected
          ? prev.selectedPlatforms.filter(id => id !== platformId)
          : [...prev.selectedPlatforms, platformId],
      };
    });
  }, []);

  const setStreamKey = useCallback((platformId: string, key: string) => {
    setSettings(prev => ({
      ...prev,
      streamKeys: { ...prev.streamKeys, [platformId]: key },
    }));
  }, []);

  const setCustomRtmpUrl = useCallback((platformId: string, url: string) => {
    setSettings(prev => ({
      ...prev,
      customRtmpUrls: { ...prev.customRtmpUrls, [platformId]: url },
    }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  return {
    settings,
    updateSettings,
    togglePlatform,
    setStreamKey,
    setCustomRtmpUrl,
    resetSettings,
  };
}
