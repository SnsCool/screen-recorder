export type RecordingStatus =
  | 'idle'
  | 'requesting_permissions'
  | 'countdown'
  | 'recording'
  | 'paused'
  | 'stopped'
  | 'processing'
  | 'uploading'
  | 'done'
  | 'error';

export type CaptureType = 'screen' | 'window' | 'tab';
export type CameraPosition = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
export type CameraSize = 'small' | 'medium' | 'large';

export interface Recording {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  duration_seconds: number;
  file_size_bytes: number;
  storage_path: string;
  thumbnail_path?: string;
  share_id?: string;
  is_public: boolean;
  has_camera: boolean;
  has_microphone: boolean;
  capture_type: CaptureType;
  resolution?: string;
  view_count: number;
  trim_start_seconds?: number;
  trim_end_seconds?: number;
  recorded_at: string;
  created_at: string;
  updated_at: string;
}
