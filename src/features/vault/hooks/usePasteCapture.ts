// src/features/vault/hooks/usePasteCapture.ts
import { useEffect, useCallback } from 'react';
import { VaultFile } from '@/types/vault';

interface UsePasteCaptureOptions {
  enabled?: boolean;
  onFilePaste: (files: File[]) => void;
}

export const usePasteCapture = ({
  enabled = true,
  onFilePaste,
}: UsePasteCaptureOptions) => {
  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      if (!enabled) return;

      const clipboardData = e.clipboardData;
      if (!clipboardData) return;

      const files: File[] = [];

      // Check for files in clipboard items
      for (let i = 0; i < clipboardData.items.length; i++) {
        const item = clipboardData.items[i];

        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) {
            files.push(file);
          }
        }
      }

      // If we found files, add them to vault
      if (files.length > 0) {
        onFilePaste(files);
      }
    },
    [enabled, onFilePaste]
  );

  useEffect(() => {
    if (enabled) {
      document.addEventListener('paste', handlePaste);
      return () => {
        document.removeEventListener('paste', handlePaste);
      };
    }
  }, [enabled, handlePaste]);
};
