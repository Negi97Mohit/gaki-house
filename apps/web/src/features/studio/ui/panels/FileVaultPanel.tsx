// src/features/studio/ui/panels/FileVaultPanel.tsx
import React, { useCallback, useState } from 'react';
import { VaultFile } from "@gaki/core/types/vault";
import {
  Upload,
  Trash2,
  FileText,
  Image,
  Film,
  Music,
  File,
  Download,
  Eye,
  Archive,
  X,
} from 'lucide-react';
import { cn } from "@gaki/core/lib/utils";
import { zIndex } from "@/lib/zIndex";
import { formatDistanceToNow } from 'date-fns';

interface FileVaultPanelProps {
  files: VaultFile[];
  onAddFiles: (files: FileList | File[], source: VaultFile['source']) => void;
  onRemoveFile: (id: string) => void;
  onClearVault: () => void;
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return Image;
  if (type.startsWith('video/')) return Film;
  if (type.startsWith('audio/')) return Music;
  if (type.includes('zip') || type.includes('rar') || type.includes('tar'))
    return Archive;
  if (
    type.includes('text') ||
    type.includes('pdf') ||
    type.includes('document')
  )
    return FileText;
  return File;
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const FileVaultPanel: React.FC<FileVaultPanelProps> = ({
  files,
  onAddFiles,
  onRemoveFile,
  onClearVault,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewFile, setPreviewFile] = useState<VaultFile | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files?.length > 0) {
        onAddFiles(e.dataTransfer.files, 'drop');
      }
    },
    [onAddFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) {
        onAddFiles(e.target.files, 'upload');
        e.target.value = '';
      }
    },
    [onAddFiles]
  );

  const handleDownload = useCallback((file: VaultFile) => {
    const link = document.createElement('a');
    link.href = file.dataUrl;
    link.download = file.name;
    link.click();
  }, []);

  const canPreview = (file: VaultFile) => {
    return (
      file.type.startsWith('image/') ||
      file.type.startsWith('video/') ||
      file.type.startsWith('audio/') ||
      file.type === 'application/pdf'
    );
  };

  return (
    <div className="flex flex-col gap-3.5 w-full antialiased">
      {/* Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-2xl p-5 transition-all duration-200 text-center',
          'bg-white/[0.02] backdrop-blur-xl',
          isDragging
            ? 'border-primary bg-primary/10 shadow-[0_0_24px_rgba(var(--primary-rgb),0.2)] scale-[1.01]'
            : 'border-white/15 hover:border-primary/60 hover:bg-white/[0.04]'
        )}
      >
        <input
          type="file"
          multiple
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center gap-1.5 pointer-events-none">
          <div className="w-9 h-9 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mb-0.5">
            <Upload
              className={cn(
                'w-4 h-4 transition-transform duration-150',
                isDragging ? 'scale-110 text-primary' : 'text-primary'
              )}
            />
          </div>
          <p className="text-[12px] font-semibold text-white tracking-tight">
            Drop assets here <span className="font-normal text-zinc-400">or click to browse</span>
          </p>
          <p className="text-[10px] text-zinc-400 font-mono">
            Images, audio, video & docs • Ctrl+V to paste
          </p>
        </div>
      </div>

      {/* File List Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold text-white tracking-tight">Stored Files</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-white/[0.05] border border-white/10 text-zinc-300">
            {files.length}
          </span>
        </div>
        {files.length > 0 && (
          <button
            onClick={onClearVault}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-medium text-red-400 hover:bg-red-500/20 border border-red-500/30 transition-all duration-150"
          >
            <Trash2 className="w-3 h-3" />
            Clear All
          </button>
        )}
      </div>

      {/* File List */}
      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center rounded-2xl bg-white/[0.02] border border-white/10">
          <Archive className="w-8 h-8 mb-2 text-zinc-500" />
          <p className="text-[12px] font-medium text-zinc-400">Vault is empty. Upload media to access during broadcast.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file) => {
            const Icon = getFileIcon(file.type);
            const isImage = file.type.startsWith('image/');

            return (
              <div
                key={file.id}
                className={cn(
                  "group flex items-center gap-3 p-3 rounded-2xl transition-all duration-150 border",
                  "bg-white/[0.03] border-white/10 hover:border-primary/60 hover:bg-white/[0.06] shadow-sm"
                )}
              >
                {/* Thumbnail or Icon */}
                <div className="flex-shrink-0 w-10 h-10 rounded-xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center">
                  {isImage ? (
                    <img
                      src={file.dataUrl}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Icon className="w-5 h-5 text-primary" />
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-white truncate">{file.name}</p>
                  <p className="text-[9px] text-zinc-400 font-mono mt-0.5">
                    {formatFileSize(file.size)} •{' '}
                    {formatDistanceToNow(file.createdAt, { addSuffix: true })}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1">
                  {canPreview(file) && (
                    <button
                      className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white flex items-center justify-center transition-colors"
                      onClick={() => setPreviewFile(file)}
                      title="Preview file"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white flex items-center justify-center transition-colors"
                    onClick={() => handleDownload(file)}
                    title="Download file"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    className="w-7 h-7 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/40 flex items-center justify-center transition-colors"
                    onClick={() => onRemoveFile(file.id)}
                    title="Remove file"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      {previewFile && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          style={{ zIndex: zIndex.fileVaultPreview }}
          onClick={() => setPreviewFile(null)}
        >
          <div
            className="relative max-w-2xl max-h-[85vh] bg-zinc-950 border border-white/15 rounded-2xl overflow-hidden shadow-2xl p-4 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewFile(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-semibold text-white mb-3 truncate max-w-[80%]">{previewFile.name}</h3>

            <div className="overflow-auto max-h-[65vh] flex items-center justify-center rounded-xl bg-black/60 p-2 slim-scrollbar">
              {previewFile.type.startsWith('image/') && (
                <img
                  src={previewFile.dataUrl}
                  alt={previewFile.name}
                  className="max-h-[60vh] max-w-full object-contain rounded-lg"
                />
              )}
              {previewFile.type.startsWith('video/') && (
                <video
                  src={previewFile.dataUrl}
                  controls
                  className="max-h-[60vh] max-w-full rounded-lg"
                />
              )}
              {previewFile.type.startsWith('audio/') && (
                <audio src={previewFile.dataUrl} controls className="w-80" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
