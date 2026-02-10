'use client';

import { useState, useCallback, useRef } from 'react';
import { cameraCaptureConstraints } from '@/lib/media/constraints';

export function useCamera() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia(cameraCaptureConstraints);
      streamRef.current = mediaStream;
      setStream(mediaStream);
      setIsActive(true);
      return mediaStream;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to access camera';
      setError(message);
      return null;
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setStream(null);
    setIsActive(false);
  }, []);

  const toggleCamera = useCallback(() => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setIsActive(track.enabled);
      }
    }
  }, []);

  return { stream, error, isActive, startCamera, stopCamera, toggleCamera };
}
