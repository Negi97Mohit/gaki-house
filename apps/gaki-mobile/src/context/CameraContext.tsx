import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";

type Facing = "user" | "environment";

interface CameraContextValue {
  videoRef: React.RefObject<HTMLVideoElement>;
  facing: Facing;
  active: boolean;
  denied: boolean;
  swapping: boolean;
  flip: () => void;
}

const CameraContext = createContext<CameraContextValue | null>(null);

export const CameraProvider = ({ children }: { children: ReactNode }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facing, setFacing] = useState<Facing>("user");
  const [active, setActive] = useState(false);
  const [denied, setDenied] = useState(false);
  const [swapping, setSwapping] = useState(false);

  const start = useCallback(async (mode: Facing) => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setDenied(true);
      return;
    }
    try {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: mode }, width: { ideal: 1080 }, height: { ideal: 1920 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
        setActive(true);
        setDenied(false);
      }
    } catch {
      setDenied(true);
      setActive(false);
    }
  }, []);

  useEffect(() => {
    start(facing);
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flip = useCallback(() => {
    setSwapping(true);
    const next: Facing = facing === "user" ? "environment" : "user";
    setFacing(next);
    // Allow blur transition to play, then start the new stream
    setTimeout(async () => {
      await start(next);
      setTimeout(() => setSwapping(false), 350);
    }, 250);
  }, [facing, start]);

  return (
    <CameraContext.Provider value={{ videoRef, facing, active, denied, swapping, flip }}>
      {children}
    </CameraContext.Provider>
  );
};

export const useCamera = () => {
  const ctx = useContext(CameraContext);
  if (!ctx) throw new Error("useCamera must be used within CameraProvider");
  return ctx;
};
