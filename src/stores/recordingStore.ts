import { create } from 'zustand';
import type { RecordingStatus, CameraPosition, CameraSize, CaptureType } from '@/types/recording';

interface RecordingStore {
  status: RecordingStatus;
  recordedBlob: Blob | null;
  cameraEnabled: boolean;
  micEnabled: boolean;
  cameraPosition: CameraPosition;
  cameraSize: CameraSize;
  captureType: CaptureType;
  elapsedSeconds: number;
  uploadProgress: number;
  error: string | null;

  setStatus: (status: RecordingStatus) => void;
  setRecordedBlob: (blob: Blob | null) => void;
  setCameraEnabled: (enabled: boolean) => void;
  setMicEnabled: (enabled: boolean) => void;
  setCameraPosition: (position: CameraPosition) => void;
  setCameraSize: (size: CameraSize) => void;
  setCaptureType: (type: CaptureType) => void;
  setElapsedSeconds: (seconds: number) => void;
  setUploadProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  status: 'idle' as RecordingStatus,
  recordedBlob: null as Blob | null,
  cameraEnabled: true,
  micEnabled: true,
  cameraPosition: 'bottom-left' as CameraPosition,
  cameraSize: 'medium' as CameraSize,
  captureType: 'screen' as CaptureType,
  elapsedSeconds: 0,
  uploadProgress: 0,
  error: null as string | null,
};

export const useRecordingStore = create<RecordingStore>((set) => ({
  ...initialState,
  setStatus: (status) => set({ status }),
  setRecordedBlob: (blob) => set({ recordedBlob: blob }),
  setCameraEnabled: (enabled) => set({ cameraEnabled: enabled }),
  setMicEnabled: (enabled) => set({ micEnabled: enabled }),
  setCameraPosition: (position) => set({ cameraPosition: position }),
  setCameraSize: (size) => set({ cameraSize: size }),
  setCaptureType: (type) => set({ captureType: type }),
  setElapsedSeconds: (seconds) => set({ elapsedSeconds: seconds }),
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));
