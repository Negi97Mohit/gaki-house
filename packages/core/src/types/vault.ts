// src/types/vault.ts

export interface VaultFile {
  id: string;
  name: string;
  type: string; // MIME type
  size: number;
  dataUrl: string; // Base64 data URL for localStorage
  createdAt: number;
  source: 'drop' | 'paste' | 'upload';
}

export interface VaultState {
  files: VaultFile[];
  isOpen: boolean;
}
