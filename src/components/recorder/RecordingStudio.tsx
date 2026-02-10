'use client';

import { useCallback, useRef, useState } from 'react';
import { Download, RotateCcw } from 'lucide-react';
import { useScreenCapture } from '@/hooks/useScreenCapture';
import { useCamera } from '@/hooks/useCamera';
import { useMicrophone } from '@/hooks/useMicrophone';
import { useMediaRecorder } from '@/hooks/useMediaRecorder';
import { useCanvasCompositor } from '@/hooks/useCanvasCompositor';
import { useRecordingTimer } from '@/hooks/useRecordingTimer';
import { useRecordingStore } from '@/stores/recordingStore';
import { RecordingControls } from './RecordingControls';
import { CameraOverlay } from './CameraOverlay';
import { CountdownTimer } from './CountdownTimer';
import { Button } from '@/components/ui/Button';
import { formatDuration } from '@/lib/utils/formatDuration';
import { formatFileSize } from '@/lib/utils/fileSize';

export function RecordingStudio() {
  const store = useRecordingStore();
  const screenCapture = useScreenCapture();
  const camera = useCamera();
  const microphone = useMicrophone();
  const timer = useRecordingTimer();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showCountdown, setShowCountdown] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);

  const compositor = useCanvasCompositor({
    cameraPosition: store.cameraPosition,
    cameraSize: store.cameraSize,
  });

  const recorder = useMediaRecorder({
    onStop: (blob) => {
      setRecordedBlob(blob);
      setRecordedUrl(URL.createObjectURL(blob));
      store.setStatus('stopped');
      timer.reset();
    },
  });

  const handleStartCapture = useCallback(async () => {
    store.setStatus('requesting_permissions');

    const screenStream = await screenCapture.startCapture();
    if (!screenStream) {
      store.setStatus('idle');
      return;
    }

    let cameraStream: MediaStream | null = null;
    if (store.cameraEnabled) {
      cameraStream = await camera.startCamera();
    }

    if (store.micEnabled) {
      await microphone.startMicrophone();
    }

    setShowCountdown(true);
    store.setStatus('countdown');

    // Store streams for later use
    (window as unknown as Record<string, unknown>).__screenStream = screenStream;
    (window as unknown as Record<string, unknown>).__cameraStream = cameraStream;
  }, [screenCapture, camera, microphone, store]);

  const handleCountdownComplete = useCallback(() => {
    setShowCountdown(false);

    const screenStream = (window as unknown as Record<string, unknown>).__screenStream as MediaStream;
    const cameraStream = (window as unknown as Record<string, unknown>).__cameraStream as MediaStream | null;

    // Start canvas compositing
    const composedVideoStream = compositor.startCompositing(screenStream, cameraStream);
    if (!composedVideoStream) return;

    // Combine video with audio
    const finalStream = new MediaStream([
      ...composedVideoStream.getVideoTracks(),
      ...(microphone.stream ? microphone.stream.getAudioTracks() : []),
    ]);

    recorder.startRecording(finalStream);
    timer.start();
    store.setStatus('recording');
  }, [compositor, recorder, microphone, timer, store]);

  const handleStop = useCallback(() => {
    recorder.stopRecording();
    compositor.stopCompositing();
    screenCapture.stopCapture();
    camera.stopCamera();
    microphone.stopMicrophone();
    timer.pause();
  }, [recorder, compositor, screenCapture, camera, microphone, timer]);

  const handlePause = useCallback(() => {
    recorder.pauseRecording();
    timer.pause();
    store.setStatus('paused');
  }, [recorder, timer, store]);

  const handleResume = useCallback(() => {
    recorder.resumeRecording();
    timer.resume();
    store.setStatus('recording');
  }, [recorder, timer, store]);

  const handleDownload = useCallback(() => {
    if (!recordedBlob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(recordedBlob);
    a.download = `recording-${Date.now()}.webm`;
    a.click();
  }, [recordedBlob]);

  const handleNewRecording = useCallback(() => {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedBlob(null);
    setRecordedUrl(null);
    store.reset();
  }, [recordedUrl, store]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white">
      {/* Hidden canvas for compositing */}
      <canvas ref={compositor.canvasRef} className="hidden" />

      {/* Countdown overlay */}
      {showCountdown && <CountdownTimer onComplete={handleCountdownComplete} />}

      {/* Main content */}
      {store.status === 'stopped' && recordedUrl ? (
        /* Preview recorded video */
        <div className="flex flex-col items-center gap-6 p-8 max-w-4xl w-full">
          <h2 className="text-2xl font-bold">Recording Complete</h2>
          <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
            <video
              src={recordedUrl}
              controls
              className="w-full h-full"
            />
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span>{formatDuration(timer.elapsed)}</span>
            {recordedBlob && (
              <>
                <span className="w-1 h-1 rounded-full bg-gray-600" />
                <span>{formatFileSize(recordedBlob.size)}</span>
              </>
            )}
          </div>
          <div className="flex gap-3">
            <Button onClick={handleDownload} variant="primary" size="lg" className="gap-2">
              <Download className="w-5 h-5" />
              Download
            </Button>
            <Button onClick={handleNewRecording} variant="secondary" size="lg" className="gap-2">
              <RotateCcw className="w-5 h-5" />
              New Recording
            </Button>
          </div>
        </div>
      ) : store.status === 'idle' ? (
        /* Welcome screen */
        <div className="flex flex-col items-center gap-8 p-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent">
              Screen Recorder
            </h1>
            <p className="text-gray-400 text-lg max-w-md">
              Record your screen with camera overlay and microphone. Share instantly.
            </p>
          </div>

          {/* Settings */}
          <div className="flex flex-col gap-4 p-6 bg-gray-900 rounded-2xl w-full max-w-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Camera</span>
              <button
                onClick={() => store.setCameraEnabled(!store.cameraEnabled)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  store.cameraEnabled ? 'bg-red-500' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    store.cameraEnabled ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Microphone</span>
              <button
                onClick={() => store.setMicEnabled(!store.micEnabled)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  store.micEnabled ? 'bg-red-500' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    store.micEnabled ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Camera Position</span>
              <select
                value={store.cameraPosition}
                onChange={(e) => store.setCameraPosition(e.target.value as typeof store.cameraPosition)}
                className="bg-gray-800 text-white text-sm rounded-lg px-3 py-1.5 border border-gray-700"
              >
                <option value="bottom-left">Bottom Left</option>
                <option value="bottom-right">Bottom Right</option>
                <option value="top-left">Top Left</option>
                <option value="top-right">Top Right</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Camera Size</span>
              <select
                value={store.cameraSize}
                onChange={(e) => store.setCameraSize(e.target.value as typeof store.cameraSize)}
                className="bg-gray-800 text-white text-sm rounded-lg px-3 py-1.5 border border-gray-700"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>

          <RecordingControls
            status={store.status}
            elapsed={timer.elapsed}
            micLevel={microphone.level}
            cameraEnabled={store.cameraEnabled}
            micEnabled={store.micEnabled}
            onStart={handleStartCapture}
            onStop={handleStop}
            onPause={handlePause}
            onResume={handleResume}
            onToggleCamera={() => store.setCameraEnabled(!store.cameraEnabled)}
            onToggleMic={() => store.setMicEnabled(!store.micEnabled)}
          />
        </div>
      ) : (
        /* Recording in progress */
        <div className="relative w-full h-screen flex flex-col items-center justify-end pb-8">
          {/* Camera preview overlay */}
          {store.cameraEnabled && camera.stream && (
            <CameraOverlay
              stream={camera.stream}
              position={store.cameraPosition}
              size={store.cameraSize}
            />
          )}

          {/* Recording controls */}
          <RecordingControls
            status={store.status}
            elapsed={timer.elapsed}
            micLevel={microphone.level}
            cameraEnabled={store.cameraEnabled}
            micEnabled={store.micEnabled}
            onStart={handleStartCapture}
            onStop={handleStop}
            onPause={handlePause}
            onResume={handleResume}
            onToggleCamera={() => {
              camera.toggleCamera();
              store.setCameraEnabled(!store.cameraEnabled);
            }}
            onToggleMic={() => {
              microphone.toggleMicrophone();
              store.setMicEnabled(!store.micEnabled);
            }}
          />
        </div>
      )}
    </div>
  );
}
