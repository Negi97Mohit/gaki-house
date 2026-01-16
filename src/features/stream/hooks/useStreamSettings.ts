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

export function useStreamSettings() {
  const [settings, setSettings] = useState<StreamSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultSettings, ...parsed };
      }
    } catch (error) {
      console.error('Failed to load stream settings:', error);
    }
    return defaultSettings;
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save stream settings:', error);
    }
  }, [settings]);

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
