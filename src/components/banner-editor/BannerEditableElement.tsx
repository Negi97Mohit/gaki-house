// src/components/banner-editor/BannerEditableElement.tsx
import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export interface BannerElementData {
  id: string;
  type: 'avatar' | 'name' | 'tagline' | 'socialLinks';
  visible: boolean;
  position: { x: number; y: number };
  style: {
    fontSize: number;
    fontFamily: string;
    color: string;
    fontWeight: string;
  };
}

interface BannerEditableElementProps {
  element: BannerElementData;
  content: React.ReactNode;
  editContent?: React.ReactNode;
  isEditing: boolean;
  isSelected: boolean;
  isTextEditing: boolean;
  containerSize: { width: number; height: number };
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
  onSelect: (id: string) => void;
  onDoubleClick: (id: string) => void;
  onRemove: (id: string) => void;
}

export const BannerEditableElement: React.FC<BannerEditableElementProps> = ({
  element,
  content,
  editContent,
  isEditing,
  isSelected,
  isTextEditing,
  containerSize,
  onPositionChange,
  onSelect,
  onDoubleClick,
  onRemove,
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

  return (
    <motion.div
      ref={elementRef}
      className={`absolute group ${isEditing ? 'cursor-move' : ''}`}
      style={{
        left: element.position.x,
        top: element.position.y,
        zIndex: isDragging || isSelected ? 100 : 10,
      }}
      drag={isEditing && !isTextEditing}
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      onClick={(e) => {
        e.stopPropagation();
        if (isEditing) onSelect(element.id);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (isEditing && (element.type === 'name' || element.type === 'tagline')) {
          onDoubleClick(element.id);
        }
      }}
      whileDrag={{ scale: 1.05 }}
    >
      {/* Selection outline - shows when banner is selected (editing mode) */}
      {isEditing && (
        <div 
          className={`absolute -inset-1 rounded border-2 transition-colors pointer-events-none ${
            isSelected ? 'border-primary bg-primary/5' : 'border-transparent group-hover:border-primary/50'
          }`}
        />
      )}
      
      {/* Delete button - shows on hover or when selected */}
      {isEditing && (
        <button
          className={`absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg z-50 transition-opacity ${
            isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(element.id);
          }}
        >
          <X className="w-3 h-3" />
        </button>
      )}

      {/* Content */}
      {isTextEditing && editContent ? editContent : content}
    </motion.div>
  );
};
