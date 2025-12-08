// src/components/banner-editor/BannerCustomizationToolbar.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Type,
  Palette,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Bold,
  Image,
  Minus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { BannerElementData } from './BannerElement';

interface BannerCustomizationToolbarProps {
  elements: BannerElementData[];
  selectedElementId: string | null;
  backgroundColor: string;
  primaryColor: string;
  secondaryColor: string;
  onElementToggle: (id: string, visible: boolean) => void;
  onElementStyleChange: (id: string, style: Partial<BannerElementData['style']>) => void;
  onBackgroundChange: (color: string) => void;
  onPrimaryColorChange: (color: string) => void;
  onSecondaryColorChange: (color: string) => void;
  onAddElement: (type: BannerElementData['type']) => void;
  onRemoveElement: (id: string) => void;
  onDeleteBanner?: () => void;
  onClose: () => void;
}

const colorPresets = [
  '#ffffff', '#000000', '#ff4444', '#ff8844', '#ffcc00',
  '#44ff44', '#00ccff', '#4488ff', '#8844ff', '#ff44ff',
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7',
  '#dfe6e9', '#a29bfe', '#fd79a8', '#00b894', '#e17055',
];

const fontPresets = [
  'Inter', 'Roboto', 'Montserrat', 'Oswald', 'Bebas Neue',
  'Orbitron', 'Press Start 2P', 'Permanent Marker', 'Anton'
];

export const BannerCustomizationToolbar: React.FC<BannerCustomizationToolbarProps> = ({
  elements,
  selectedElementId,
  backgroundColor,
  primaryColor,
  secondaryColor,
  onElementToggle,
  onElementStyleChange,
  onBackgroundChange,
  onPrimaryColorChange,
  onSecondaryColorChange,
  onAddElement,
  onRemoveElement,
  onDeleteBanner,
  onClose,
}) => {
  const selectedElement = elements.find(e => e.id === selectedElementId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute -top-14 left-1/2 -translate-x-1/2 bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-xl p-2 flex items-center gap-2 z-[200]"
    >
      {/* Element Visibility Controls */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <Eye className="w-4 h-4 mr-1" />
            Elements
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="start">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground mb-2">Show/Hide Elements</p>
            {elements.map((element) => (
              <div key={element.id} className="flex items-center justify-between py-1">
                <span className="text-sm capitalize">{element.type}</span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => onElementToggle(element.id, !element.visible)}
                  >
                    {element.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-destructive"
                    onClick={() => onRemoveElement(element.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
            <div className="border-t pt-2 mt-2">
              <p className="text-xs text-muted-foreground mb-1">Add Element</p>
              <div className="flex gap-1 flex-wrap">
                <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => onAddElement('name')}>
                  <Plus className="w-3 h-3 mr-1" /> Text
                </Button>
                <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => onAddElement('avatar')}>
                  <Plus className="w-3 h-3 mr-1" /> Avatar
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Font Size Control */}
      {selectedElement && selectedElement.type !== 'avatar' && (
        <div className="flex items-center gap-1 px-2 border-l border-border">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => onElementStyleChange(selectedElement.id, {
              fontSize: Math.max(10, selectedElement.style.fontSize - 2)
            })}
          >
            <Minus className="w-3 h-3" />
          </Button>
          <span className="text-xs w-8 text-center">{selectedElement.style.fontSize}px</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => onElementStyleChange(selectedElement.id, {
              fontSize: Math.min(72, selectedElement.style.fontSize + 2)
            })}
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      )}

      {/* Font Family */}
      {selectedElement && selectedElement.type !== 'avatar' && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <Type className="w-4 h-4 mr-1" />
              Font
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="center">
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {fontPresets.map((font) => (
                <Button
                  key={font}
                  variant={selectedElement.style.fontFamily === font ? 'secondary' : 'ghost'}
                  size="sm"
                  className="w-full justify-start h-7"
                  style={{ fontFamily: font }}
                  onClick={() => onElementStyleChange(selectedElement.id, { fontFamily: font })}
                >
                  {font}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Text Color */}
      {selectedElement && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <div
                className="w-4 h-4 rounded border border-border mr-1"
                style={{ backgroundColor: selectedElement.style.color }}
              />
              Color
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2" align="center">
            <div className="grid grid-cols-5 gap-1">
              {colorPresets.map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded border-2 transition-transform hover:scale-110 ${selectedElement.style.color === color ? 'border-primary' : 'border-transparent'
                    }`}
                  style={{ backgroundColor: color }}
                  onClick={() => onElementStyleChange(selectedElement.id, { color })}
                />
              ))}
            </div>
            <input
              type="color"
              value={selectedElement.style.color}
              onChange={(e) => onElementStyleChange(selectedElement.id, { color: e.target.value })}
              className="w-full h-8 mt-2 cursor-pointer rounded"
            />
          </PopoverContent>
        </Popover>
      )}

      {/* Background Colors */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 px-2 border-l border-border ml-1">
            <Palette className="w-4 h-4 mr-1" />
            Theme
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="end">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium mb-2">Primary Color</p>
              <div className="flex gap-1 flex-wrap">
                {colorPresets.slice(0, 10).map((color) => (
                  <button
                    key={color}
                    className={`w-6 h-6 rounded border ${primaryColor === color ? 'border-primary border-2' : 'border-border'}`}
                    style={{ backgroundColor: color }}
                    onClick={() => onPrimaryColorChange(color)}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-2">Secondary Color</p>
              <div className="flex gap-1 flex-wrap">
                {colorPresets.slice(0, 10).map((color) => (
                  <button
                    key={color}
                    className={`w-6 h-6 rounded border ${secondaryColor === color ? 'border-primary border-2' : 'border-border'}`}
                    style={{ backgroundColor: color }}
                    onClick={() => onSecondaryColorChange(color)}
                  />
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {onDeleteBanner && (
        <Button
          variant="destructive"
          size="sm"
          className="h-8 w-8 p-0 ml-1 rounded-full"
          onClick={onDeleteBanner}
          title="Remove Banner"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}

      <Button variant="ghost" size="sm" className="h-8 px-2 ml-1" onClick={onClose}>
        Done
      </Button>
    </motion.div>
  );
};
