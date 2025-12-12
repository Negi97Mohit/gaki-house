// src/components/stream-scenes/StreamStyleSelector.tsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Tv, 
  Play, 
  Pause, 
  Coffee, 
  Clock, 
  Power, 
  Video,
  ChevronRight,
  Sparkles,
  Zap,
  Gamepad2,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  STREAM_STYLE_PRESETS, 
  StreamStylePreset, 
  StreamSceneType,
  DEFAULT_STREAM_SCENES
} from '@/types/streamStyle';
import { StreamSceneRenderer } from './StreamSceneRenderer';
import { cn } from '@/lib/utils';

interface StreamStyleSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyStyle: (preset: StreamStylePreset) => void;
}

export const StreamStyleSelector: React.FC<StreamStyleSelectorProps> = ({
  isOpen,
  onClose,
  onApplyStyle
}) => {
  const [selectedPreset, setSelectedPreset] = useState<StreamStylePreset | null>(null);
  const [previewScene, setPreviewScene] = useState<StreamSceneType>('starting-soon');
  const [step, setStep] = useState<'select' | 'preview' | 'confirm'>('select');

  const getSceneIcon = (type: StreamSceneType) => {
    const icons: Record<StreamSceneType, React.ReactNode> = {
      'starting-soon': <Clock className="w-4 h-4" />,
      'live': <Video className="w-4 h-4" />,
      'brb': <Coffee className="w-4 h-4" />,
      'intermission': <Pause className="w-4 h-4" />,
      'ending': <Power className="w-4 h-4" />,
      'offline': <Tv className="w-4 h-4" />
    };
    return icons[type];
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'anime': return <Sparkles className="w-4 h-4" />;
      case 'neon': return <Zap className="w-4 h-4" />;
      case 'gaming': return <Gamepad2 className="w-4 h-4" />;
      default: return <Tv className="w-4 h-4" />;
    }
  };

  const handleSelectPreset = (preset: StreamStylePreset) => {
    setSelectedPreset(preset);
    setStep('preview');
  };

  const handleApply = () => {
    if (selectedPreset) {
      onApplyStyle(selectedPreset);
      onClose();
    }
  };

  const handleBack = () => {
    if (step === 'preview') {
      setStep('select');
      setSelectedPreset(null);
    } else if (step === 'confirm') {
      setStep('preview');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-[90vw] max-w-5xl max-h-[80vh] min-h-[400px] bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              {step !== 'select' && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBack}
                  className="mr-2"
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </Button>
              )}
              <Tv className="w-6 h-6 text-primary" />
              <div>
                <h2 className="text-xl font-bold">Stream Style Setup</h2>
                <p className="text-sm text-muted-foreground">
                  {step === 'select' && 'Choose a style to auto-generate all stream scenes'}
                  {step === 'preview' && `Preview "${selectedPreset?.name}" scenes`}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {step === 'select' && (
              <ScrollArea className="h-full">
                <div className="p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {STREAM_STYLE_PRESETS.map((preset) => (
                      <motion.div
                        key={preset.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card
                          className={cn(
                            'cursor-pointer transition-all duration-200 overflow-hidden',
                            'hover:border-primary/50 hover:shadow-lg',
                            selectedPreset?.id === preset.id && 'border-primary ring-2 ring-primary/20'
                          )}
                          onClick={() => handleSelectPreset(preset)}
                        >
                          {/* Preview thumbnail */}
                          <div className="aspect-video relative overflow-hidden bg-muted">
                            <div className="absolute inset-0 scale-[0.5] origin-top-left w-[200%] h-[200%]">
                              <StreamSceneRenderer
                                sceneType="starting-soon"
                                theme={preset.theme}
                                className="w-full h-full"
                              />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
                          </div>
                          
                          <CardHeader className="p-3 pb-2">
                            <div className="flex items-center justify-between gap-1">
                              <CardTitle className="text-sm truncate">{preset.name}</CardTitle>
                              <Badge variant="secondary" className="flex items-center gap-0.5 text-[10px] px-1.5 py-0">
                                {getCategoryIcon(preset.theme.category)}
                              </Badge>
                            </div>
                            <CardDescription className="text-xs line-clamp-1">{preset.description}</CardDescription>
                          </CardHeader>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            )}

            {step === 'preview' && selectedPreset && (
              <div className="h-full flex flex-col sm:flex-row">
                {/* Scene list - horizontal on mobile, sidebar on desktop */}
                <div className="sm:w-48 border-b sm:border-b-0 sm:border-r border-border p-2 sm:p-3">
                  <div className="flex sm:flex-col gap-1 overflow-x-auto sm:overflow-x-visible">
                    {DEFAULT_STREAM_SCENES.map((scene) => (
                      <Button
                        key={scene.id}
                        variant={previewScene === scene.id ? 'secondary' : 'ghost'}
                        size="sm"
                        className="flex-shrink-0 justify-start gap-1.5 text-xs"
                        onClick={() => setPreviewScene(scene.id)}
                      >
                        {getSceneIcon(scene.id)}
                        <span className="hidden sm:inline">{scene.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Preview area */}
                <div className="flex-1 p-3 flex flex-col min-h-0">
                  <div className="flex-1 rounded-lg overflow-hidden border border-border shadow-inner aspect-video">
                    <StreamSceneRenderer
                      sceneType={previewScene}
                      theme={selectedPreset.theme}
                      showCamera={DEFAULT_STREAM_SCENES.find(s => s.id === previewScene)?.hasCamera}
                    />
                  </div>
                  
                  {/* Color palette preview */}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Colors:</span>
                    <div className="flex gap-1">
                      {Object.entries(selectedPreset.theme.colors).slice(0, 5).map(([name, color]) => (
                        <div
                          key={name}
                          className="w-5 h-5 rounded-full border border-border"
                          style={{ background: color }}
                          title={name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/30">
            <div className="text-sm text-muted-foreground">
              {step === 'preview' && (
                <span>All {DEFAULT_STREAM_SCENES.length} scenes will be created with this style</span>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              {step === 'preview' && (
                <Button onClick={handleApply} className="gap-2">
                  <Check className="w-4 h-4" />
                  Apply Style & Create Scenes
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StreamStyleSelector;
