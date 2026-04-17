import React from "react";
import { create } from "zustand";

export interface LogEntry {
  timestamp: string;
  type: "INFO" | "ERROR" | "AI_REQUEST" | "AI_RESPONSE" | "TRANSCRIPT";
  message: string;
  data?: any;
}

type LogStore = {
  logEntries: LogEntry[];
  log: (type: LogEntry["type"], message: string, data?: any) => void;
};

const useLogStore = create<LogStore>((set) => ({
  logEntries: [],
  log: (type, message, data) => {
    const newEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      type,
      message,
      data,
    };
    console.log(`[${type}] ${message}`, data || "");
    set((state) => ({ logEntries: [...state.logEntries, newEntry] }));
  },
}));

// Pass-through provider so we don't have to touch App.tsx
export const LogProvider = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);

export const useLog = () => useLogStore();
