// src/features/studio/ui/panels/FileVaultPanel.tsx
import React, { useCallback, useState } from 'react';
import { Button } from "@gaki/ui/button";
import { ScrollArea } from "@gaki/ui/scroll-area";
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
    <div className="flex flex-col h-full gap-3">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 transition-all duration-200',
          isDragging
            ? 'border-primary bg-primary/10 scale-[1.01]'
            : 'border-border hover:border-primary/50'
        )}
      >
        <input
          type="file"
          multiple
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center gap-2 pointer-events-none">
          <Upload
            className={cn(
              'w-8 h-8 transition-colors',
              isDragging ? 'text-primary' : 'text-muted-foreground'
            )}
          />
          <p className="text-sm text-muted-foreground text-center">
            <span className="font-medium text-foreground">Drop files here</span>{' '}
            or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            Max 5MB per file • Paste with Ctrl+V
          </p>
        </div>
      </div>

      {/* File List Header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-sm text-muted-foreground font-mono">
          {files.length} file{files.length !== 1 ? 's' : ''}
        </span>
        {files.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearVault}
            className="text-destructive hover:text-destructive h-7 text-xs"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* File List */}
      <ScrollArea className="flex-1">
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Archive className="w-10 h-10 mb-2 opacity-50" />
            <p className="text-sm font-mono">Vault is empty</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 pr-2">
            {files.map((file) => {
              const Icon = getFileIcon(file.type);
              const isImage = file.type.startsWith('image/');

              return (
                <div
                  key={file.id}
                  className="group flex items-center gap-3 p-2 rounded border bg-card hover:bg-accent/50 transition-colors"
                >
                  {/* Thumbnail or Icon */}
                  <div className="flex-shrink-0 w-10 h-10 rounded overflow-hidden bg-muted flex items-center justify-center">
                    {isImage ? (
                      <img
                        src={file.dataUrl}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Icon className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{file.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {formatFileSize(file.size)} •{' '}
                      {formatDistanceToNow(file.createdAt, { addSuffix: true })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {canPreview(file) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setPreviewFile(file)}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleDownload(file)}
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => onRemoveFile(file.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Preview Modal */}
      {previewFile && (
        <div
          className="fixed inset-0 z-[10000] bg-black/90 flex items-center justify-center p-8"
          onClick={() => setPreviewFile(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={() => setPreviewFile(null)}
          >
            <X className="w-6 h-6" />
          </Button>
          <div
            className="max-w-full max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            {previewFile.type.startsWith('image/') && (
              <img
                src={previewFile.dataUrl}
                alt={previewFile.name}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
            )}
            {previewFile.type.startsWith('video/') && (
              <video
                src={previewFile.dataUrl}
                controls
                className="max-w-full max-h-[80vh] rounded-lg"
              />
            )}
            {previewFile.type.startsWith('audio/') && (
              <audio src={previewFile.dataUrl} controls className="w-96" />
            )}
            {previewFile.type === 'application/pdf' && (
              <iframe
                src={previewFile.dataUrl}
                className="w-[80vw] h-[80vh] rounded-lg bg-white"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
