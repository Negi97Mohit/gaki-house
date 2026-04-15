import React, { useRef } from 'react';
import Moveable, { OnDrag, OnResize, OnRotate } from 'react-moveable';
import Selecto from 'react-selecto';
import { useEngineTargets } from './useEngineTargets';
import { LayoutUpdate } from '@/features/canvas/ui/HybridDraggable'; // For type consistency

interface InteractionManagerProps {
  selectedIds: string[];
  containerSize: { width: number; height: number };
  viewportScale?: number;
  onOverlayLayoutChange?: (id: string, key: "position" | "size" | "rotation", value: any) => void;
  onOverlayLayoutSync?: (id: string, key: "position" | "size" | "rotation", value: any) => void;
}

export const InteractionManager: React.FC<InteractionManagerProps> = ({
  selectedIds,
  containerSize,
  viewportScale = 1,
  onOverlayLayoutChange,
  onOverlayLayoutSync,
}) => {
  const targets = useEngineTargets(selectedIds);
  const moveableRef = useRef<Moveable>(null);

  if (!targets.length) return null;

  return (
    <>
      <Moveable
        ref={moveableRef}
      target={targets}
      draggable={true}
      resizable={true}
      rotatable={true}
      snappable={true}
      snapCenter={true}
      // Rulers and guides can be added here
      onDrag={(e: OnDrag) => {
        const { target, beforeTranslate } = e;
        target.style.transform = `translate(${beforeTranslate[0]}px, ${beforeTranslate[1]}px) rotate(${e.transform.match(/rotate\(([^)]+)\)/)?.[1] || '0deg'})`;
        
        if (onOverlayLayoutSync) {
          const id = target.getAttribute('data-engine-id');
          if (id) {
            onOverlayLayoutSync(id, 'position', {
              x: (beforeTranslate[0] / containerSize.width) * 100,
              y: (beforeTranslate[1] / containerSize.height) * 100
            });
          }
        }
      }}
      onDragEnd={(e) => {
        if (!onOverlayLayoutChange) return;
        const target = e.target as HTMLElement;
        const id = target.getAttribute('data-engine-id');
        if (!id) return;
        
        // Parse transform to get translate values
        const transform = target.style.transform;
        const match = transform.match(/translate\(([^p]+)px,\s*([^p]+)px\)/);
        if (match) {
          const x = parseFloat(match[1]);
          const y = parseFloat(match[2]);
          
          // Convert to percentage
          const percentX = (x / containerSize.width) * 100;
          const percentY = (y / containerSize.height) * 100;
          
          onOverlayLayoutChange(id, 'position', { x: percentX, y: percentY });
        }
      }}
      onResize={(e: OnResize) => {
        const { target, width, height, drag } = e;
        target.style.width = `${width}px`;
        target.style.height = `${height}px`;
        target.style.transform = `translate(${drag.beforeTranslate[0]}px, ${drag.beforeTranslate[1]}px) rotate(${e.transform.match(/rotate\(([^)]+)\)/)?.[1] || '0deg'})`;
        
        if (onOverlayLayoutSync) {
          const id = target.getAttribute('data-engine-id');
          if (id) {
            onOverlayLayoutSync(id, 'size', {
              width: (width / containerSize.width) * 100,
              height: (height / containerSize.height) * 100
            });
            onOverlayLayoutSync(id, 'position', {
              x: (drag.beforeTranslate[0] / containerSize.width) * 100,
              y: (drag.beforeTranslate[1] / containerSize.height) * 100
            });
          }
        }
      }}
      onResizeEnd={(e) => {
        if (!onOverlayLayoutChange) return;
        const target = e.target as HTMLElement;
        const id = target.getAttribute('data-engine-id');
        if (!id) return;
        
        const widthPercent = (target.offsetWidth / containerSize.width) * 100;
        const heightPercent = (target.offsetHeight / containerSize.height) * 100;
        
        onOverlayLayoutChange(id, 'size', { width: widthPercent, height: heightPercent });
        
        // Trigger drag end to commit position if top/left resize handles were used
        const transform = target.style.transform;
        const match = transform.match(/translate\(([^p]+)px,\s*([^p]+)px\)/);
        if (match) {
          onOverlayLayoutChange(id, 'position', { 
            x: (parseFloat(match[1]) / containerSize.width) * 100, 
            y: (parseFloat(match[2]) / containerSize.height) * 100 
          });
        }
      }}
      onRotate={(e: OnRotate) => {
        const { target, beforeRotate } = e;
        const transform = target.style.transform;
        const translateMatch = transform.match(/translate\([^)]+\)/);
        const translate = translateMatch ? translateMatch[0] : `translate(0px, 0px)`;
        
        target.style.transform = `${translate} rotate(${beforeRotate}deg)`;
        
        if (onOverlayLayoutSync) {
          const id = target.getAttribute('data-engine-id');
          if (id) {
            onOverlayLayoutSync(id, 'rotation', beforeRotate);
          }
        }
      }}
      onRotateEnd={(e) => {
        if (!onOverlayLayoutChange) return;
        const target = e.target as HTMLElement;
        const id = target.getAttribute('data-engine-id');
        if (!id) return;
        
        const transform = target.style.transform;
        const match = transform.match(/rotate\(([^d]+)deg\)/);
        if (match) {
          onOverlayLayoutChange(id, 'rotation', parseFloat(match[1]));
        }
      }}
      />
      <Selecto
        dragContainer={document.body}
        selectableTargets={["[data-engine-id]"]}
        hitRate={0}
        selectByClick={true}
        selectFromInside={false}
        toggleContinueSelect={["shift"]}
        onSelect={(e) => {
          e.added.forEach(el => {
            el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
          });
        }}
      />
    </>
  );
};
