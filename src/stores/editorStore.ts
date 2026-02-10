import { create } from 'zustand';

interface EditorStore {
  videoUrl: string | null;
  videoBlob: Blob | null;
  duration: number;
  trimStart: number;
  trimEnd: number;
  isPlaying: boolean;
  currentTime: number;
  isTrimming: boolean;
  trimProgress: number;

  setVideoUrl: (url: string | null) => void;
  setVideoBlob: (blob: Blob | null) => void;
  setDuration: (duration: number) => void;
  setTrimStart: (time: number) => void;
  setTrimEnd: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setIsTrimming: (trimming: boolean) => void;
  setTrimProgress: (progress: number) => void;
  reset: () => void;
}

export const useEditorStore = create<EditorStore>((set) => ({
  videoUrl: null,
  videoBlob: null,
  duration: 0,
  trimStart: 0,
  trimEnd: 0,
  isPlaying: false,
  currentTime: 0,
  isTrimming: false,
  trimProgress: 0,

  setVideoUrl: (url) => set({ videoUrl: url }),
  setVideoBlob: (blob) => set({ videoBlob: blob }),
  setDuration: (duration) => set({ duration, trimEnd: duration }),
  setTrimStart: (time) => set({ trimStart: time }),
  setTrimEnd: (time) => set({ trimEnd: time }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setIsTrimming: (trimming) => set({ isTrimming: trimming }),
  setTrimProgress: (progress) => set({ trimProgress: progress }),
  reset: () =>
    set({
      videoUrl: null,
      videoBlob: null,
      duration: 0,
      trimStart: 0,
      trimEnd: 0,
      isPlaying: false,
      currentTime: 0,
      isTrimming: false,
      trimProgress: 0,
    }),
}));
