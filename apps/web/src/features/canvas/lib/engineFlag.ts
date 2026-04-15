export const isV2Engine = import.meta.env.NEXT_PUBLIC_INTERACTION_ENGINE_V2 === 'true' || import.meta.env.INTERACTION_ENGINE_V2 === 'true';
export const isDesktop = typeof window !== 'undefined' && (window as any).captionCamDesktopApi !== undefined;
