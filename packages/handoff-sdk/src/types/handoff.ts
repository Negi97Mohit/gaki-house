export type DevicePlatform = "web" | "desktop" | "mobile";
export type DeviceStatus = "idle" | "streaming" | "receiving";

export interface HandoffDevice {
  deviceId: string;
  platform: DevicePlatform;
  status: DeviceStatus;
  lastActive: number | any; // 'any' accommodates Firestore serverTimestamp
}

export type SignalAction = "OFFER" | "TAKEOVER";
export type SignalStatus = "PENDING" | "ACCEPTED" | "COMPLETED";

export interface HandoffSignal {
  sourceDeviceId: string;
  targetDeviceId: string;
  action: SignalAction;
  status: SignalStatus;
  timestamp: any;
}
