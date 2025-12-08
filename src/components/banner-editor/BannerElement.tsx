// src/components/banner-editor/BannerElement.tsx
import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

export interface BannerElementData {
  id: string;
  type: 'avatar' | 'name' | 'tagline' | 'socialLinks' | 'custom';
  content: string;
  visible: boolean;
  position: { x: number; y: number };
  style: {
    fontSize: number;
    fontFamily: string;
    color: string;
    fontWeight: string;
  };
}

interface BannerElementProps {
  element: BannerElementData;
  isEditing: boolean;
  containerSize: { width: number; height: number };
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
  onContentChange: (id: string, content: string) => void;
  onStyleChange: (id: string, style: Partial<BannerElementData['style']>) => void;
  onSelect: (id: string) => void;
  isSelected: boolean;
}

export const BannerElement: React.FC<BannerElementProps> = ({
  element,
  isEditing,
  containerSize,
  onPositionChange,
  onContentChange,
  onStyleChange,
  onSelect,
  isSelected,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = useCallback((e: any, info: any) => {
    const newX = Math.max(0, Math.min(element.position.x + info.offset.x, containerSize.width - 50));
    const newY = Math.max(0, Math.min(element.position.y + info.offset.y, containerSize.height - 20));
    onPositionChange(element.id, { x: newX, y: newY });
    setIsDragging(false);
  }, [element.id, element.position, containerSize, onPositionChange]);

  if (!element.visible) return null;

  if (element.type === 'avatar') {
    return (
      <motion.div
        ref={elementRef}
        className={`absolute cursor-move ${isSelected ? 'ring-2 ring-primary' : ''}`}
        style={{
          left: element.position.x,
          top: element.position.y,
          width: element.style.fontSize * 3,
          height: element.style.fontSize * 3,
        }}
        drag={isEditing}
        dragMomentum={false}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        onClick={() => isEditing && onSelect(element.id)}
        whileDrag={{ scale: 1.05, zIndex: 100 }}
      >
        <div
          className="w-full h-full rounded-full flex items-center justify-center overflow-hidden"
          style={{
            background: element.content || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: '2px solid rgba(255,255,255,0.3)',
          }}
        >
          {element.content?.startsWith('http') ? (
            <img src={element.content} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <svg width="50%" height="50%" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={elementRef}
      className={`absolute cursor-move ${isSelected ? 'ring-2 ring-primary rounded px-1' : ''}`}
      style={{
        left: element.position.x,
        top: element.position.y,
      }}
      drag={isEditing}
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      onClick={() => isEditing && onSelect(element.id)}
      whileDrag={{ scale: 1.02, zIndex: 100 }}
    >
      {isEditing && isSelected ? (
        <input
          type="text"
          value={element.content}
          onChange={(e) => onContentChange(element.id, e.target.value)}
          className="bg-transparent border-none outline-none"
          style={{
            fontSize: element.style.fontSize,
            fontFamily: element.style.fontFamily,
            color: element.style.color,
            fontWeight: element.style.fontWeight,
            minWidth: '50px',
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span
          style={{
            fontSize: element.style.fontSize,
            fontFamily: element.style.fontFamily,
            color: element.style.color,
            fontWeight: element.style.fontWeight,
            whiteSpace: 'nowrap',
          }}
        >
          {element.content}
        </span>
      )}
    </motion.div>
  );
};
