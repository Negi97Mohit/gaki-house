export interface ElectronWindow {
  electron?: {
    getDesktopSources: (options: any) => Promise<any[]>;
    getAppWindowId: () => Promise<string | null>;
    stream: {
      start: (config: any) => void;
      sendData: (chunk: ArrayBuffer) => void;
      stop: (config?: any) => void;
      onStatus: (callback: (data: any) => void) => void;
    };
  };
}
