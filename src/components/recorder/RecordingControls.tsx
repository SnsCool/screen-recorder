'use client';

import { Circle, Square, Pause, Play, Camera, CameraOff, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AudioIndicator } from './AudioIndicator';
import { formatDuration } from '@/lib/utils/formatDuration';
import type { RecordingStatus } from '@/types/recording';

interface RecordingControlsProps {
  status: RecordingStatus;
  elapsed: number;
  micLevel: number;
  cameraEnabled: boolean;
  micEnabled: boolean;
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
  onToggleCamera: () => void;
  onToggleMic: () => void;
}

export function RecordingControls({
  status,
  elapsed,
  micLevel,
  cameraEnabled,
  micEnabled,
  onStart,
  onStop,
  onPause,
  onResume,
  onToggleCamera,
  onToggleMic,
}: RecordingControlsProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-900/95 backdrop-blur rounded-2xl shadow-2xl">
      {/* Recording timer */}
      {(status === 'recording' || status === 'paused') && (
        <div className="flex items-center gap-2 px-3">
          <div className={`w-3 h-3 rounded-full ${status === 'recording' ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'}`} />
          <span className="text-white font-mono text-lg font-semibold">
            {formatDuration(elapsed)}
          </span>
        </div>
      )}

      {/* Main controls */}
      <div className="flex items-center gap-2">
        {status === 'idle' && (
          <Button onClick={onStart} variant="primary" size="lg" className="gap-2 rounded-full">
            <Circle className="w-5 h-5 fill-current" />
            Start Recording
          </Button>
        )}

        {status === 'recording' && (
          <>
            <button
              onClick={onPause}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <Pause className="w-5 h-5" />
            </button>
            <button
              onClick={onStop}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
            >
              <Square className="w-5 h-5 fill-current" />
            </button>
          </>
        )}

        {status === 'paused' && (
          <>
            <button
              onClick={onResume}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <Play className="w-5 h-5" />
            </button>
            <button
              onClick={onStop}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
            >
              <Square className="w-5 h-5 fill-current" />
            </button>
          </>
        )}
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-white/20" />

      {/* Camera toggle */}
      <button
        onClick={onToggleCamera}
        className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
          cameraEnabled ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-white/5 text-white/40'
        }`}
      >
        {cameraEnabled ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
      </button>

      {/* Mic toggle + level */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleMic}
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
            micEnabled ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-white/5 text-white/40'
          }`}
        >
          {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </button>
        <AudioIndicator level={micLevel} isActive={micEnabled} />
      </div>
    </div>
  );
}
