import React from "react";

export const SettingsPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="w-3 h-3 rounded-full bg-primary/40 animate-pulse mb-6" />
      <h1 className="text-2xl font-bold text-foreground tracking-tight">Settings</h1>
      <p className="text-sm text-muted-foreground mt-2 max-w-md">
        Account and preferences.
      </p>
    </div>
  );
};
