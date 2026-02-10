'use client';

import { useState, useCallback, useRef } from 'react';
import { getSupportedMimeType } from '@/lib/media/constraints';

interface UseMediaRecorderOptions {
  onDataAvailable?: (blob: Blob) => void;
  onStop?: (blob: Blob) => void;
  videoBitsPerSecond?: number;
}

export function useMediaRecorder(options: UseMediaRecorderOptions = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback((stream: MediaStream) => {
    try {
      chunksRef.current = [];
      const mimeType = getSupportedMimeType();
      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: options.videoBitsPerSecond || 2500000,
      });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
          options.onDataAvailable?.(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        options.onStop?.(blob);
        setIsRecording(false);
        setIsPaused(false);
      };

      recorder.onerror = () => {
        setError('Recording failed');
        setIsRecording(false);
      };

      recorder.start(1000);
      recorderRef.current = recorder;
      setIsRecording(true);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start recording';
      setError(message);
    }
  }, [options]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
  }, []);

  const pauseRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state === 'recording') {
      recorderRef.current.pause();
      setIsPaused(true);
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state === 'paused') {
      recorderRef.current.resume();
      setIsPaused(false);
    }
  }, []);

  return {
    isRecording,
    isPaused,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
  };
}
