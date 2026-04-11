import React, { createContext, useContext, useState, useCallback } from "react";
import { StreamChannel } from "../data/mockData";

interface PipState {
  channel: StreamChannel | null;
  isActive: boolean;
  isMuted: boolean;
}

interface PipContextValue {
  pip: PipState;
  openPip: (channel: StreamChannel) => void;
  closePip: () => void;
  togglePipMute: () => void;
}

const PipContext = createContext<PipContextValue | null>(null);

export const usePip = () => {
  const ctx = useContext(PipContext);
  if (!ctx) throw new Error("usePip must be used within PipProvider");
  return ctx;
};

export const PipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pip, setPip] = useState<PipState>({
    channel: null,
    isActive: false,
    isMuted: true,
  });

  const openPip = useCallback((channel: StreamChannel) => {
    setPip({ channel, isActive: true, isMuted: true });
  }, []);

  const closePip = useCallback(() => {
    setPip({ channel: null, isActive: false, isMuted: true });
  }, []);

  const togglePipMute = useCallback(() => {
    setPip((prev) => ({ ...prev, isMuted: !prev.isMuted }));
  }, []);

  return (
    <PipContext.Provider value={{ pip, openPip, closePip, togglePipMute }}>
      {children}
    </PipContext.Provider>
  );
};
