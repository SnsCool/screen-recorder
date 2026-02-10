'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { formatDuration } from '@/lib/utils/formatDuration';

interface TimelineProps {
  duration: number;
  trimStart: number;
  trimEnd: number;
  currentTime: number;
  onTrimStartChange: (time: number) => void;
  onTrimEndChange: (time: number) => void;
  onSeek: (time: number) => void;
}

export function Timeline({
  duration,
  trimStart,
  trimEnd,
  currentTime,
  onTrimStartChange,
  onTrimEndChange,
  onSeek,
}: TimelineProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<'start' | 'end' | 'playhead' | null>(null);

  const getTimeFromPosition = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return 0;
      const rect = track.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return ratio * duration;
    },
    [duration]
  );

  const handleMouseDown = useCallback(
    (type: 'start' | 'end' | 'playhead') => (e: React.MouseEvent) => {
      e.preventDefault();
      setDragging(type);
    },
    []
  );

  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const time = getTimeFromPosition(e.clientX);
      switch (dragging) {
        case 'start':
          onTrimStartChange(Math.min(time, trimEnd - 0.5));
          break;
        case 'end':
          onTrimEndChange(Math.max(time, trimStart + 0.5));
          break;
        case 'playhead':
          onSeek(Math.max(trimStart, Math.min(trimEnd, time)));
          break;
      }
    };

    const handleMouseUp = () => setDragging(null);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, trimStart, trimEnd, getTimeFromPosition, onTrimStartChange, onTrimEndChange, onSeek]);

  const startPercent = duration > 0 ? (trimStart / duration) * 100 : 0;
  const endPercent = duration > 0 ? (trimEnd / duration) * 100 : 100;
  const playheadPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="space-y-2">
      {/* Time labels */}
      <div className="flex justify-between text-xs text-gray-400 font-mono">
        <span>{formatDuration(trimStart)}</span>
        <span>{formatDuration(currentTime)}</span>
        <span>{formatDuration(trimEnd)}</span>
      </div>

      {/* Timeline track */}
      <div
        ref={trackRef}
        className="relative h-16 bg-gray-800 rounded-lg overflow-hidden cursor-pointer"
        onClick={(e) => {
          if (!dragging) {
            const time = getTimeFromPosition(e.clientX);
            onSeek(time);
          }
        }}
      >
        {/* Inactive regions */}
        <div
          className="absolute inset-y-0 left-0 bg-black/60 z-10"
          style={{ width: `${startPercent}%` }}
        />
        <div
          className="absolute inset-y-0 right-0 bg-black/60 z-10"
          style={{ width: `${100 - endPercent}%` }}
        />

        {/* Active region */}
        <div
          className="absolute inset-y-0 border-y-2 border-red-500 z-10"
          style={{ left: `${startPercent}%`, right: `${100 - endPercent}%` }}
        />

        {/* Trim start handle */}
        <div
          className="absolute inset-y-0 z-20 w-4 cursor-col-resize flex items-center justify-center group"
          style={{ left: `calc(${startPercent}% - 8px)` }}
          onMouseDown={handleMouseDown('start')}
        >
          <div className="w-1.5 h-10 bg-red-500 rounded-full group-hover:bg-red-400 transition-colors" />
        </div>

        {/* Trim end handle */}
        <div
          className="absolute inset-y-0 z-20 w-4 cursor-col-resize flex items-center justify-center group"
          style={{ left: `calc(${endPercent}% - 8px)` }}
          onMouseDown={handleMouseDown('end')}
        >
          <div className="w-1.5 h-10 bg-red-500 rounded-full group-hover:bg-red-400 transition-colors" />
        </div>

        {/* Playhead */}
        <div
          className="absolute inset-y-0 z-30 w-0.5 bg-white"
          style={{ left: `${playheadPercent}%` }}
          onMouseDown={handleMouseDown('playhead')}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full cursor-grab" />
        </div>

        {/* Waveform placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-end gap-px h-8">
            {Array.from({ length: 100 }).map((_, i) => (
              <div
                key={i}
                className="w-0.5 bg-gray-600 rounded-full"
                style={{ height: `${Math.random() * 100}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Duration info */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>Trim: {formatDuration(trimEnd - trimStart)}</span>
        <span>Total: {formatDuration(duration)}</span>
      </div>
    </div>
  );
}
