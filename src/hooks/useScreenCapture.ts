'use client';

import { useState, useCallback, useRef } from 'react';
import { screenCaptureConstraints } from '@/lib/media/constraints';

export function useScreenCapture() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const startCapture = useCallback(async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getDisplayMedia(screenCaptureConstraints);

      mediaStream.getVideoTracks()[0].addEventListener('ended', () => {
        setStream(null);
        setIsCapturing(false);
        streamRef.current = null;
      });

      streamRef.current = mediaStream;
      setStream(mediaStream);
      setIsCapturing(true);
      return mediaStream;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to capture screen';
      setError(message);
      setIsCapturing(false);
      return null;
    }
  }, []);

  const stopCapture = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setStream(null);
    setIsCapturing(false);
  }, []);

  return { stream, error, isCapturing, startCapture, stopCapture };
}
