'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { Play, Pause, Download, Scissors, Loader2, RotateCcw } from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';
import { useFFmpeg } from '@/hooks/useFFmpeg';
import { Timeline } from './Timeline';
import { Button } from '@/components/ui/Button';
import { formatDuration } from '@/lib/utils/formatDuration';
import { formatFileSize } from '@/lib/utils/fileSize';

interface VideoEditorProps {
  videoBlob: Blob;
  videoUrl: string;
  onExport?: (trimmedBlob: Blob) => void;
}

export function VideoEditor({ videoBlob, videoUrl, onExport }: VideoEditorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const store = useEditorStore();
  const ffmpeg = useFFmpeg();
  const [trimmedBlob, setTrimmedBlob] = useState<Blob | null>(null);
  const [trimmedUrl, setTrimmedUrl] = useState<string | null>(null);

  // Initialize store
  useEffect(() => {
    store.setVideoUrl(videoUrl);
    store.setVideoBlob(videoBlob);
    return () => store.reset();
  }, [videoUrl, videoBlob]);

  // Load FFmpeg on mount
  useEffect(() => {
    ffmpeg.load();
  }, []);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoadedMetadata = () => {
      store.setDuration(video.duration);
    };
    const onTimeUpdate = () => {
      store.setCurrentTime(video.currentTime);
      // Loop within trim range
      if (video.currentTime >= store.trimEnd) {
        video.pause();
        store.setIsPlaying(false);
      }
    };
    const onEnded = () => store.setIsPlaying(false);

    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('ended', onEnded);

    return () => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('ended', onEnded);
    };
  }, [store.trimEnd]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      if (video.currentTime < store.trimStart || video.currentTime >= store.trimEnd) {
        video.currentTime = store.trimStart;
      }
      video.play();
      store.setIsPlaying(true);
    } else {
      video.pause();
      store.setIsPlaying(false);
    }
  }, [store.trimStart, store.trimEnd]);

  const handleSeek = useCallback((time: number) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = time;
      store.setCurrentTime(time);
    }
  }, []);

  const handleTrim = useCallback(async () => {
    if (!ffmpeg.isLoaded) return;
    store.setIsTrimming(true);

    const result = await ffmpeg.trim(videoBlob, store.trimStart, store.trimEnd);
    if (result) {
      setTrimmedBlob(result);
      const url = URL.createObjectURL(result);
      setTrimmedUrl(url);
      onExport?.(result);
    }

    store.setIsTrimming(false);
  }, [ffmpeg, videoBlob, store.trimStart, store.trimEnd, onExport]);

  const handleDownload = useCallback(() => {
    const blob = trimmedBlob || videoBlob;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `recording-${Date.now()}.webm`;
    a.click();
  }, [trimmedBlob, videoBlob]);

  const handleReset = useCallback(() => {
    store.setTrimStart(0);
    store.setTrimEnd(store.duration);
    if (trimmedUrl) URL.revokeObjectURL(trimmedUrl);
    setTrimmedBlob(null);
    setTrimmedUrl(null);
  }, [store.duration, trimmedUrl]);

  const hasTrimmed = trimmedBlob !== null;
  const currentVideoUrl = trimmedUrl || videoUrl;

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      {/* Video preview */}
      <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
        <video
          ref={videoRef}
          src={currentVideoUrl}
          className="w-full h-full cursor-pointer"
          onClick={togglePlay}
          playsInline
        />

        {/* Play overlay */}
        {!store.isPlaying && (
          <div
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            onClick={togglePlay}
          >
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <Play className="w-8 h-8 text-white ml-1" fill="white" />
            </div>
          </div>
        )}
      </div>

      {/* Playback controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={togglePlay}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          {store.isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" fill="white" />}
        </button>
        <span className="text-white/60 text-sm font-mono">
          {formatDuration(store.currentTime)} / {formatDuration(store.duration)}
        </span>
      </div>

      {/* Timeline */}
      <Timeline
        duration={store.duration}
        trimStart={store.trimStart}
        trimEnd={store.trimEnd}
        currentTime={store.currentTime}
        onTrimStartChange={(t) => store.setTrimStart(t)}
        onTrimEndChange={(t) => store.setTrimEnd(t)}
        onSeek={handleSeek}
      />

      {/* Action buttons */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          onClick={handleTrim}
          disabled={!ffmpeg.isLoaded || store.isTrimming || (store.trimStart === 0 && store.trimEnd === store.duration)}
          variant="primary"
          size="lg"
          className="gap-2"
        >
          {store.isTrimming ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Trimming... {ffmpeg.progress}%
            </>
          ) : (
            <>
              <Scissors className="w-5 h-5" />
              Trim Video
            </>
          )}
        </Button>

        <Button onClick={handleDownload} variant="secondary" size="lg" className="gap-2">
          <Download className="w-5 h-5" />
          Download {hasTrimmed ? 'Trimmed' : 'Original'}
          {(trimmedBlob || videoBlob) && (
            <span className="text-xs opacity-60">
              ({formatFileSize((trimmedBlob || videoBlob).size)})
            </span>
          )}
        </Button>

        {hasTrimmed && (
          <Button onClick={handleReset} variant="ghost" size="lg" className="gap-2">
            <RotateCcw className="w-5 h-5" />
            Reset
          </Button>
        )}

        {!ffmpeg.isLoaded && (
          <span className="text-sm text-yellow-400">
            {ffmpeg.isLoading ? 'Loading FFmpeg...' : ffmpeg.error || 'FFmpeg not loaded'}
          </span>
        )}
      </div>
    </div>
  );
}
