import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BottomNav, { Tab } from "@/features/navigation/ui/BottomNav";
import VideoBackdrop from "@/features/studio/ui/VideoBackdrop";
import Logo from "@/components/ui/Logo";
import StudioScreen from "@/features/studio/ui/StudioScreen";
import SettingsScreen from "@/features/studio/ui/SettingsScreen";
import EffectsPanel from "@/features/studio/ui/EffectsScreen";
import DestinationsPanel from "@/features/studio/ui/DestinationsScreen";
import DiscoverScreen from "@/features/studio/ui/DiscoverScreen";
import RemoteControlScreen from "@/features/studio/ui/RemoteControlScreen";
import AuthSheet from "@/features/auth/ui/AuthSheet";
import ProfileSheet from "@/features/auth/ui/ProfileSheet";
import SheetDrawer from "@/components/ui/SheetDrawer";
import { CameraProvider } from "@/context/CameraContext";
import { FxProvider } from "@/context/FxContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

type Drawer = "discover" | "remote" | "destinations" | "settings" | null;

/** Maps URL pathname to the active drawer value. */
const pathToDrawer = (pathname: string): Drawer => {
  const segment = pathname.replace(/^\//, "").split("/")[0];
  if (
    segment === "discover" ||
    segment === "remote" ||
    segment === "destinations" ||
    segment === "settings"
  ) {
    return segment;
  }
  return null; // "/studio" or any unknown path → studio (default)
};

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Derive active drawer from the current URL path
  const activeDrawer = useMemo(
    () => pathToDrawer(location.pathname),
    [location.pathname]
  );

  const [authOpen, setAuthOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [immersive, setImmersive] = useState(false);
  const [assetsOpen, setAssetsOpen] = useState(false);
  const [discoverControlsVisible, setDiscoverControlsVisible] = useState(true);

  const handleTabChange = (next: Tab) => {
    if (next === "studio") {
      navigate("/studio");
      return;
    }
    // If tapping the already-active tab, go back to studio
    if (activeDrawer === next) {
      navigate("/studio");
    } else {
      navigate(`/${next}`);
    }
  };

  const handleProfileClick = () => {
    if (user) {
      setProfileOpen(true);
    } else {
      setAuthOpen(true);
    }
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

    // Skip if the tap is on an interactive element or a draggable canvas overlay
    if (
      hit?.closest("button, a, input, textarea, select, [role='button']") ||
      target?.closest("button, a, input, textarea, select, [role='button']") ||
      hit?.closest("[data-overlay], .cursor-move") ||
      target?.closest("[data-overlay], .cursor-move")
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
              <RemoteControlScreen onBack={() => navigate("/studio")} />
            )}

            <SheetDrawer
              open={activeDrawer === "destinations"}
              onClose={() => navigate("/studio")}
              eyebrow="Destinations"
              title="Multistream"
            >
              <DestinationsPanel />
            </SheetDrawer>

            <SheetDrawer
              open={activeDrawer === "settings"}
              onClose={() => navigate("/studio")}
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
              onProfileClick={handleProfileClick}
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

          {/* Auth sheet — shown when not logged in */}
          <AuthSheet open={authOpen} onClose={() => setAuthOpen(false)} />

          {/* Profile sheet — shown when logged in */}
          <ProfileSheet open={profileOpen} onClose={() => setProfileOpen(false)} />
        </main>
      </FxProvider>
    </CameraProvider>
  );
};

export default Index;
