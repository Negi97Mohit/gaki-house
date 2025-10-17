// src/components/DraggableBrowser.tsx

import React, { useState, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { cn } from '@/lib/utils';
import { X, Globe, ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react';

export interface BrowserOverlayState {
  id: string;
  url: string;
  layout: {
    position: { x: number; y: number };
    size: { width: number; height: number };
    zIndex: number;
    rotation: number;
  };
}

interface DraggableBrowserProps {
  overlay: BrowserOverlayState;
  onLayoutChange: (id: string, layout: Partial<BrowserOverlayState['layout']>) => void;
  onUrlChange: (id: string, url: string) => void;
  onRemove: (id: string) => void;
  containerSize: { width: number; height: number };
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const DraggableBrowser: React.FC<DraggableBrowserProps> = ({
  overlay,
  onLayoutChange,
  onUrlChange,
  onRemove,
  containerSize,
  isSelected,
  onSelect,
}) => {
  const [inputUrl, setInputUrl] = useState(overlay.url);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleSubmitUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedUrl = inputUrl.startsWith('http') ? inputUrl : `https://${inputUrl}`;
    const proxiedUrl = `/.netlify/functions/proxy?url=${encodeURIComponent(formattedUrl)}`;
    onUrlChange(overlay.id, proxiedUrl);
  };

  const handleGoBack = () => {
    iframeRef.current?.contentWindow?.history.back();
  };

  const handleRefresh = () => {
    iframeRef.current?.contentWindow?.location.reload();
  };

  const widthPx = (containerSize.width * overlay.layout.size.width) / 100;
  const heightPx = (containerSize.height * overlay.layout.size.height) / 100;
  const xPx = (containerSize.width * overlay.layout.position.x) / 100 - widthPx / 2;
  const yPx = (containerSize.height * overlay.layout.position.y) / 100 - heightPx / 2;

  return (
    <Rnd
      size={{ width: widthPx, height: heightPx }}
      position={{ x: xPx, y: yPx }}
      onDragStart={() => {
        onSelect(overlay.id);
        setIsDragging(true);
      }}
      onDragStop={(e, d) => {
        setIsDragging(false);
        onLayoutChange(overlay.id, {
          position: {
            x: ((d.x + widthPx / 2) / containerSize.width) * 100,
            y: ((d.y + heightPx / 2) / containerSize.height) * 100,
          },
        });
      }}
      minWidth={250}
      minHeight={200}
      bounds="parent"
      onResizeStop={(e, dir, ref, delta, pos) => {
        const newWidth = parseInt(ref.style.width, 10);
        const newHeight = parseInt(ref.style.height, 10);
        onLayoutChange(overlay.id, {
          position: {
            x: ((pos.x + newWidth / 2) / containerSize.width) * 100,
            y: ((pos.y + newHeight / 2) / containerSize.height) * 100,
          },
          size: {
            width: (newWidth / containerSize.width) * 100,
            height: (newHeight / containerSize.height) * 100,
          },
        });
      }}
      className={cn(
        'group pointer-events-auto bg-card shadow-lg rounded-lg flex flex-col overflow-hidden transition-all duration-200',
        isSelected ? 'border-2 border-primary ring-4 ring-primary/30' : 'border-2 border-primary/50'
      )}
      style={{ zIndex: overlay.layout.zIndex, transform: `rotate(${overlay.layout.rotation}deg)` }}
    >
      <div
        onMouseDown={() => onSelect(overlay.id)}
        className="flex-shrink-0 h-10 bg-secondary flex items-center p-2 gap-2 cursor-move"
      >
        <button onClick={handleGoBack} className="p-1 hover:bg-primary/20 rounded-sm" title="Back">
          <ArrowLeft className="w-4 h-4 text-muted-foreground"/>
        </button>
        <button onClick={handleRefresh} className="p-1 hover:bg-primary/20 rounded-sm" title="Refresh">
          <RefreshCw className="w-4 h-4 text-muted-foreground"/>
        </button>
        <Globe className="w-4 h-4 text-muted-foreground" />
        <form onSubmit={handleSubmitUrl} className="flex-1">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="w-full bg-background rounded-sm px-2 py-0.5 text-[clamp(0.7rem,1.5vw,0.9rem)]"
            onClick={(e) => e.stopPropagation()} 
            placeholder="Enter URL..."
          />
        </form>
        <button onClick={handleSubmitUrl} className="p-1 hover:bg-primary/20 rounded-sm">
          <ArrowRight className="w-4 h-4"/>
        </button>
      </div>
      <div className="flex-grow w-full h-full border-none relative">
        <iframe
          ref={iframeRef}
          src={overlay.url}
          className="w-full h-full"
          sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts"
          title={`browser-overlay-${overlay.id}`}
        />
        {isDragging && <div className="absolute inset-0 z-10 bg-transparent" />}
      </div>
      <button
        onClick={() => onRemove(overlay.id)}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-50"
      >
        <X className="w-4 h-4" />
      </button>
    </Rnd>
  );
};