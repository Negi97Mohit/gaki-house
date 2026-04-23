import { useState } from "react";
import BottomNav, { Tab } from "@/components/BottomNav";
import VideoBackdrop from "@/components/VideoBackdrop";
import Logo from "@/components/Logo";
import StudioScreen from "@/components/screens/StudioScreen";
import SettingsScreen from "@/components/screens/SettingsScreen";
import EffectsPanel from "@/components/screens/EffectsScreen";
import DestinationsPanel from "@/components/screens/DestinationsScreen";
import DiscoverScreen from "@/components/screens/DiscoverScreen";
import RemoteControlScreen from "@/components/screens/RemoteControlScreen";
import AuthSheet from "@/components/AuthSheet";
import SheetDrawer from "@/components/SheetDrawer";
import { CameraProvider } from "@/context/CameraContext";
import { FxProvider } from "@/context/FxContext";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

type Drawer = "discover" | "remote" | "destinations" | "settings" | null;

const Index = () => {
  const [activeDrawer, setActiveDrawer] = useState<Drawer>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [immersive, setImmersive] = useState(false);
  const [assetsOpen, setAssetsOpen] = useState(false);
  const [discoverControlsVisible, setDiscoverControlsVisible] = useState(true);

  const handleTabChange = (next: Tab) => {
    if (next === "studio") {
      setActiveDrawer(null);
      return;
    }
    setActiveDrawer((current) => (current === next ? null : (next as Drawer)));
  };

  // Tap on the empty preview area toggles immersive mode.
  // We use pointerup with a small drag guard so swipes (filter cycle) don't trigger it.
  const downRef = { x: 0, y: 0, t: 0 };
  const onPointerDown = (e: React.PointerEvent) => {
    downRef.x = e.clientX;
    downRef.y = e.clientY;
    downRef.t = Date.now();
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const dx = e.clientX - downRef.x;
    const dy = e.clientY - downRef.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    const dt = Date.now() - downRef.t;
    const hit = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    const target = e.target as HTMLElement | null;
    if (
      hit?.closest("button, a, input, textarea, select, [role='button']") ||
      target?.closest("button, a, input, textarea, select, [role='button']")
    ) {
      return;
    }
    if (absDx < 10 && absDy < 10 && dt < 400) {
      setImmersive((v) => !v);
    } else if (absDy > 30 && absDy > absDx) {
      // Swipes (simulating scroll up or down)
      if (dy < -30) {
        setImmersive(true); // Scroll up (swipe finger up)
      } else if (dy > 30) {
        setImmersive(false); // Scroll down
      }
    }
  };

  const onWheel = (e: React.WheelEvent) => {
    if (e.deltaY > 20) {
      setImmersive(true); // Scroll up
    } else if (e.deltaY < -20) {
      setImmersive(false); // Scroll down
    }
  };

  // When the assets composer is open, hide every other UI surface so only
  // the live overlays/captions/canvas remain visible — fully immersive.
  const hideAllUi = assetsOpen;

  return (
    <CameraProvider>
      <FxProvider>
        <main 
          className="relative h-[100dvh] w-full overflow-hidden"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onWheel={onWheel}
        >
          <VideoBackdrop />

          {/* Logo container, detached from activeDrawer so it's always visible unless immersive or in remote section */}
          <div
            className={cn(
              "absolute inset-0 transition-opacity duration-300 z-[80] pointer-events-none",
              immersive || hideAllUi || activeDrawer === "remote" ? "opacity-0" : "opacity-100"
            )}
          >
            <Logo />
          </div>

          <div
            className={cn(
              "absolute inset-0 transition-opacity duration-300 z-10 pointer-events-none",
              immersive || activeDrawer || hideAllUi ? "opacity-0" : "opacity-100"
            )}
          >
            <div className="h-full w-full animate-fade-in-up">
              <StudioScreen onOpenAssets={() => setAssetsOpen(true)} />
            </div>
          </div>

          <div
            className={cn(
              "transition-opacity duration-300",
              immersive || hideAllUi ? "opacity-0 pointer-events-none" : "opacity-100"
            )}
          >
            {activeDrawer === "discover" && (
              <DiscoverScreen onControlsVisibilityChange={setDiscoverControlsVisible} />
            )}

            {activeDrawer === "remote" && (
              <RemoteControlScreen onBack={() => setActiveDrawer(null)} />
            )}

            <SheetDrawer
              open={activeDrawer === "destinations"}
              onClose={() => setActiveDrawer(null)}
              eyebrow="Destinations"
              title="Multistream"
            >
              <DestinationsPanel />
            </SheetDrawer>

            <SheetDrawer
              open={activeDrawer === "settings"}
              onClose={() => setActiveDrawer(null)}
              eyebrow="Settings"
              title="Preferences"
            >
              <SettingsScreen />
            </SheetDrawer>
          </div>

          <div
            className={cn(
              "transition-opacity duration-300",
              immersive || hideAllUi || (activeDrawer === "discover" && !discoverControlsVisible)
                ? "opacity-0 pointer-events-none"
                : "opacity-100"
            )}
          >
            <BottomNav
              activeDrawer={activeDrawer}
              onChange={handleTabChange}
              onProfileClick={() => setAuthOpen(true)}
            />
          </div>

          {/* Asset composer — transparent sheet with only the asset picker visible */}
          <SheetDrawer open={assetsOpen} onClose={() => setAssetsOpen(false)} transparent>
            <EffectsPanel />
          </SheetDrawer>

          {/* Floating 'Done' check button to exit asset composer */}
          {assetsOpen && (
            <button
              onClick={() => setAssetsOpen(false)}
              aria-label="Done adding assets"
              className="fixed bottom-8 right-5 z-[60] h-12 w-12 rounded-full bg-white/90 backdrop-blur-md border border-white/60 text-neutral-900 shadow-float flex items-center justify-center active:scale-95 transition-transform"
              style={{ animation: "fade-in-up 0.3s var(--ease-out-soft) both" }}
            >
              <Check className="h-5 w-5" strokeWidth={2.6} />
            </button>
          )}

          <AuthSheet open={authOpen} onClose={() => setAuthOpen(false)} />
        </main>
      </FxProvider>
    </CameraProvider>
  );
};

export default Index;
