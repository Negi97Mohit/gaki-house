import React, { useEffect, useState } from "react";
import { useSceneCollectionStore } from "@/stores/sceneCollection.store";
import { useCompositeStream } from "@/features/stream/hooks/useCompositeStream";
import * as Tooltip from "@radix-ui/react-tooltip";

// Icons 
const Volume2 = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
);

const VolumeX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
);

const AudioMeter = ({ level }: { level: number }) => {
  // level is 0-1, we display it as a height percentage
  // We'll use a simple green -> yellow -> red gradient
  return (
    <div className="w-1.5 h-full bg-zinc-900 rounded-sm relative overflow-hidden">
      <div 
        className="absolute bottom-0 w-full rounded-sm transition-all duration-75"
        style={{
          height: `${Math.min(100, level * 100)}%`,
          background: "linear-gradient(to top, #22c55e 0%, #eab308 70%, #ef4444 100%)",
        }}
      />
    </div>
  );
};

export const AudioMixer = ({ audioMixer }: { audioMixer: any }) => {
  const collection = useSceneCollectionStore((s) => s.collection);
  const setMasterVolume = useSceneCollectionStore((s) => s.setMasterVolume);
  const setMasterMuted = useSceneCollectionStore((s) => s.setMasterMuted);
  const setSourceAudio = useSceneCollectionStore((s) => s.setSourceAudio);

  // Poll levels
  const [levels, setLevels] = useState<Record<string, { peak: number; rms: number }>>({});

  useEffect(() => {
    if (!audioMixer) return;

    let raf: number;
    const poll = () => {
      setLevels(audioMixer.getAllLevels());
      raf = requestAnimationFrame(poll);
    };
    raf = requestAnimationFrame(poll);

    return () => cancelAnimationFrame(raf);
  }, [audioMixer]);

  const activeScene = collection.scenes.find((s) => s.id === collection.activeSceneId);
  const activeSources = activeScene ? activeScene.sources.filter(s => s.type === 'camera' || s.type === 'screen_capture' || s.type === 'media') : [];

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 w-full text-zinc-300 shadow-xl flex gap-6 overflow-x-auto">
      {/* Active Sources */}
      {activeSources.map((source) => {
        const audio = source.audio;
        const level = levels[source.id]?.peak || 0;

        return (
          <div key={source.id} className="flex flex-col items-center gap-3 min-w-[60px]">
            <div className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider truncate max-w-[80px]">
              {source.name}
            </div>
            
            <div className="flex gap-2 h-32 items-end">
              <AudioMeter level={level} />
              
              <div className="h-full relative group p-2 mx-[-8px]">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={audio.volume}
                  onChange={(e) => setSourceAudio(activeScene!.id, source.id, { volume: parseFloat(e.target.value) })}
                  className="mixer-slider"
                  style={{ writingMode: "vertical-lr", direction: "rtl", WebkitAppearance: "slider-vertical", width: "8px", height: "100%" } as any}
                />
              </div>
            </div>

            <button
              onClick={() => setSourceAudio(activeScene!.id, source.id, { muted: !audio.muted })}
              className={`p-2 rounded-lg transition-colors ${audio.muted ? "bg-red-500/20 text-red-400" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"}`}
            >
              {audio.muted ? <VolumeX /> : <Volume2 />}
            </button>
          </div>
        );
      })}

      {/* Divider */}
      {activeSources.length > 0 && (
        <div className="w-[1px] h-full bg-zinc-800 shrink-0" />
      )}

      {/* Master Output */}
      <div className="flex flex-col items-center gap-3 min-w-[60px]">
        <div className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider truncate">
          Master
        </div>
        
        <div className="flex gap-2 h-32 items-end">
          <AudioMeter level={levels['master']?.peak || 0} />
          
          <div className="h-full relative group p-2 mx-[-8px]">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={collection.audioMixer.masterVolume}
              onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
              className="mixer-slider accent-blue-500"
              style={{ writingMode: "vertical-lr", direction: "rtl", WebkitAppearance: "slider-vertical", width: "8px", height: "100%" } as any}
            />
          </div>
        </div>

        <button
          onClick={() => setMasterMuted(!collection.audioMixer.masterMuted)}
          className={`p-2 rounded-lg transition-colors ${collection.audioMixer.masterMuted ? "bg-red-500/20 text-red-400" : "bg-blue-600/20 text-blue-400 hover:bg-blue-600/40"}`}
        >
          {collection.audioMixer.masterMuted ? <VolumeX /> : <Volume2 />}
        </button>
      </div>
      
      <style>{`
        /* Custom range styling logic could go here */
        .mixer-slider {
          outline: none;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};
