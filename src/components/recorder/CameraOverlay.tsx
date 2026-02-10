'use client';

import { useRef, useEffect, useState } from 'react';
import type { CameraPosition, CameraSize } from '@/types/recording';

interface CameraOverlayProps {
  stream: MediaStream | null;
  position: CameraPosition;
  size: CameraSize;
  onPositionChange?: (position: CameraPosition) => void;
}

const SIZES = {
  small: 'w-24 h-24',
  medium: 'w-36 h-36',
  large: 'w-48 h-48',
};

const POSITIONS = {
  'bottom-left': 'bottom-6 left-6',
  'bottom-right': 'bottom-6 right-6',
  'top-left': 'top-6 left-6',
  'top-right': 'top-6 right-6',
};

export function CameraOverlay({ stream, position, size }: CameraOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (!stream || !isVisible) return null;

  return (
    <div
      className={`absolute ${POSITIONS[position]} ${SIZES[size]} z-20 cursor-move`}
      onClick={() => setIsVisible(!isVisible)}
    >
      <div className="w-full h-full rounded-full overflow-hidden border-4 border-white/80 shadow-2xl">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover scale-x-[-1]"
        />
      </div>
    </div>
  );
}
