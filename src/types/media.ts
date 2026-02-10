export interface MediaDeviceState {
  stream: MediaStream | null;
  enabled: boolean;
  error: string | null;
}

export interface CompositorConfig {
  screenStream: MediaStream;
  cameraStream?: MediaStream;
  cameraPosition: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  cameraSize: 'small' | 'medium' | 'large';
  fps: number;
}

export interface RecorderConfig {
  mimeType: string;
  videoBitsPerSecond: number;
  audioBitsPerSecond: number;
}
