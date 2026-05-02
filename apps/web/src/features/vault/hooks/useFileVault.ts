// src/features/vault/hooks/useFileVault.ts
import { useState, useEffect, useCallback } from 'react';
import { VaultFile } from "@gaki/core/types/vault";
import { generateId } from "@gaki/core/lib/id";
import { notify } from "@gaki/core/lib/notify";

const VAULT_STORAGE_KEY = 'lovable-file-vault';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit per file for localStorage

export const useFileVault = () => {
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(VAULT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as VaultFile[];
        setFiles(parsed);
      }
    } catch (error) {
      console.error('Failed to load vault from localStorage:', error);
    }
  }, []);

  // Save to localStorage whenever files change
  useEffect(() => {
    try {
      localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(files));
    } catch (error) {
      console.error('Failed to save vault to localStorage:', error);
      notify.error('Storage limit reached. Try removing some files.');
    }
  }, [files]);

  const fileToVaultFile = useCallback(
    (file: File, source: VaultFile['source']): Promise<VaultFile | null> => {
      return new Promise((resolve) => {
        if (file.size > MAX_FILE_SIZE) {
          notify.error(`File "${file.name}" is too large (max 5MB)`);
          resolve(null);
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          if (typeof e.target?.result === 'string') {
            resolve({
              id: generateId('vault'),
              name: file.name,
              type: file.type || 'application/octet-stream',
              size: file.size,
              dataUrl: e.target.result,
              createdAt: Date.now(),
              source,
            });
          } else {
            resolve(null);
          }
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
    },
    []
  );

  const addFiles = useCallback(
    async (fileList: FileList | File[], source: VaultFile['source']) => {
      const filesArray = Array.from(fileList);
      const results = await Promise.all(
        filesArray.map((f) => fileToVaultFile(f, source))
      );
      const validFiles = results.filter((f): f is VaultFile => f !== null);

      if (validFiles.length > 0) {
        setFiles((prev) => [...validFiles, ...prev]);
        notify.success(`Added ${validFiles.length} file(s) to vault`);
      }
    },
    [fileToVaultFile]
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    notify.info('File removed from vault');
  }, []);

  const clearVault = useCallback(() => {
    setFiles([]);
    notify.info('Vault cleared');
  }, []);

  const openVault = useCallback(() => setIsOpen(true), []);
  const closeVault = useCallback(() => setIsOpen(false), []);
  const toggleVault = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    files,
    isOpen,
    openVault,
    closeVault,
    toggleVault,
    addFiles,
    removeFile,
    clearVault,
  };
};
