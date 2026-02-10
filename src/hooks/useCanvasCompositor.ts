'use client';

import { useRef, useCallback, useEffect } from 'react';
import type { CameraPosition, CameraSize } from '@/types/recording';

interface CompositorOptions {
  cameraPosition: CameraPosition;
  cameraSize: CameraSize;
  fps?: number;
}

const CAMERA_SIZES = {
  small: 120,
  medium: 180,
  large: 240,
};

const CAMERA_MARGIN = 24;

function getCameraOffset(
  canvasWidth: number,
  canvasHeight: number,
  size: number,
  position: CameraPosition
) {
  const margin = CAMERA_MARGIN;
  switch (position) {
    case 'bottom-left':
      return { x: margin, y: canvasHeight - size - margin };
    case 'bottom-right':
      return { x: canvasWidth - size - margin, y: canvasHeight - size - margin };
    case 'top-left':
      return { x: margin, y: margin };
    case 'top-right':
      return { x: canvasWidth - size - margin, y: margin };
  }
}

export function useCanvasCompositor(options: CompositorOptions) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const animationRef = useRef<number>(0);
  const composedStreamRef = useRef<MediaStream | null>(null);

  const fps = options.fps || 30;
  const interval = 1000 / fps;

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const screenVideo = screenVideoRef.current;
    if (!canvas || !screenVideo) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw screen
    ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);

    // Draw camera overlay
    const cameraVideo = cameraVideoRef.current;
    if (cameraVideo && cameraVideo.readyState >= 2) {
      const size = CAMERA_SIZES[options.cameraSize];
      const { x, y } = getCameraOffset(canvas.width, canvas.height, size, options.cameraPosition);

      ctx.save();
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(cameraVideo, x, y, size, size);
      ctx.restore();

      // Draw border
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }, [options.cameraPosition, options.cameraSize]);

  const startCompositing = useCallback(
    (screenStream: MediaStream, cameraStream?: MediaStream | null) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      // Set up screen video
      const screenVideo = document.createElement('video');
      screenVideo.srcObject = screenStream;
      screenVideo.muted = true;
      screenVideo.play();
      screenVideoRef.current = screenVideo;

      // Set canvas size to match screen
      const screenTrack = screenStream.getVideoTracks()[0];
      const settings = screenTrack.getSettings();
      canvas.width = settings.width || 1920;
      canvas.height = settings.height || 1080;

      // Set up camera video
      if (cameraStream) {
        const cameraVideo = document.createElement('video');
        cameraVideo.srcObject = cameraStream;
        cameraVideo.muted = true;
        cameraVideo.play();
        cameraVideoRef.current = cameraVideo;
      }

      // Start drawing loop
      let lastTime = 0;
      const draw = (timestamp: number) => {
        if (timestamp - lastTime >= interval) {
          drawFrame();
          lastTime = timestamp;
        }
        animationRef.current = requestAnimationFrame(draw);
      };
      animationRef.current = requestAnimationFrame(draw);

      // Create composed stream from canvas
      const composedStream = canvas.captureStream(fps);
      composedStreamRef.current = composedStream;
      return composedStream;
    },
    [drawFrame, fps, interval]
  );

  const stopCompositing = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (screenVideoRef.current) {
      screenVideoRef.current.pause();
      screenVideoRef.current.srcObject = null;
      screenVideoRef.current = null;
    }
    if (cameraVideoRef.current) {
      cameraVideoRef.current.pause();
      cameraVideoRef.current.srcObject = null;
      cameraVideoRef.current = null;
    }
    composedStreamRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return {
    canvasRef,
    composedStream: composedStreamRef.current,
    startCompositing,
    stopCompositing,
  };
}
