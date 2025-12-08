// src/components/banner-editor/BannerInternalDraggable.tsx
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface BannerInternalDraggableProps {
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

export const BannerInternalDraggable: React.FC<BannerInternalDraggableProps> = ({
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
  const elementRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startPosRef = useRef({ pointerX: 0, pointerY: 0, elementX: 0, elementY: 0 });
  const currentPosRef = useRef({ x: element.position.x, y: element.position.y });
  const lastClickRef = useRef(0);

  // Sync position from props when not dragging
  useEffect(() => {
    if (!isDragging) {
      currentPosRef.current = { x: element.position.x, y: element.position.y };
    }
  }, [element.position, isDragging]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!isEditing || isTextEditing) return;
    
    e.stopPropagation();
    e.preventDefault();
    
    const target = e.target as HTMLElement;
    if (target.closest('.remove-btn')) return;

    elementRef.current?.setPointerCapture(e.pointerId);
    
    startPosRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      elementX: currentPosRef.current.x,
      elementY: currentPosRef.current.y,
    };

    onSelect(element.id);
  }, [isEditing, isTextEditing, element.id, onSelect]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!elementRef.current?.hasPointerCapture(e.pointerId)) return;
    
    e.stopPropagation();
    e.preventDefault();

    const deltaX = e.clientX - startPosRef.current.pointerX;
    const deltaY = e.clientY - startPosRef.current.pointerY;

    // Start dragging after threshold
    if (!isDragging && (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3)) {
      setIsDragging(true);
    }

    if (isDragging || Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      let newX = startPosRef.current.elementX + deltaX;
      let newY = startPosRef.current.elementY + deltaY;

      // Clamp to container bounds
      const elWidth = elementRef.current?.offsetWidth || 50;
      const elHeight = elementRef.current?.offsetHeight || 20;
      newX = Math.max(0, Math.min(newX, containerSize.width - elWidth));
      newY = Math.max(0, Math.min(newY, containerSize.height - elHeight));

      currentPosRef.current = { x: newX, y: newY };

      // Direct DOM update for smooth dragging
      if (elementRef.current) {
        elementRef.current.style.left = `${newX}px`;
        elementRef.current.style.top = `${newY}px`;
      }
    }
  }, [isDragging, containerSize]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!elementRef.current?.hasPointerCapture(e.pointerId)) return;
    
    e.stopPropagation();
    elementRef.current.releasePointerCapture(e.pointerId);

    if (isDragging) {
      // Commit position change
      onPositionChange(element.id, currentPosRef.current);
      setIsDragging(false);
    } else {
      // Handle click/double-click
      const now = Date.now();
      if (now - lastClickRef.current < 300) {
        onDoubleClick(element.id);
        lastClickRef.current = 0;
      } else {
        lastClickRef.current = now;
      }
    }
  }, [isDragging, element.id, onPositionChange, onDoubleClick]);

  if (!element.visible) return null;

  return (
    <div
      ref={elementRef}
      data-banner-element="true"
      className={cn(
        "absolute group touch-none",
        isEditing && !isTextEditing && "cursor-move"
      )}
      style={{
        left: element.position.x,
        top: element.position.y,
        zIndex: isDragging || isSelected ? 100 : 10,
        willChange: isDragging ? 'transform' : 'auto',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Selection outline */}
      {isEditing && (
        <div 
          className={cn(
            "absolute -inset-1.5 rounded-md border-2 transition-all pointer-events-none",
            isSelected 
              ? "border-primary bg-primary/10 shadow-[0_0_8px_rgba(var(--primary),0.3)]" 
              : "border-transparent group-hover:border-primary/40"
          )}
        />
      )}
      
      {/* Delete button */}
      {isEditing && (
        <button
          className={cn(
            "remove-btn absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground",
            "flex items-center justify-center shadow-lg z-50 transition-all cursor-pointer",
            "hover:scale-110 hover:bg-destructive/90",
            isSelected || isDragging ? "opacity-100 scale-100" : "opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100"
          )}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onRemove(element.id);
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <X className="w-3 h-3" />
        </button>
      )}

      {/* Content */}
      <div className={cn(isDragging && "pointer-events-none")}>
        {isTextEditing && editContent ? editContent : content}
      </div>
    </div>
  );
};
