'use client';

import { useState, useRef, useCallback } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export function useFFmpeg() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);

  const load = useCallback(async () => {
    if (isLoaded || isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const ffmpeg = new FFmpeg();
      ffmpegRef.current = ffmpeg;

      ffmpeg.on('progress', ({ progress: p }) => {
        setProgress(Math.round(p * 100));
      });

      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      setIsLoaded(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load FFmpeg';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, isLoading]);

  const trim = useCallback(
    async (inputBlob: Blob, startTime: number, endTime: number): Promise<Blob | null> => {
      const ffmpeg = ffmpegRef.current;
      if (!ffmpeg || !isLoaded) {
        setError('FFmpeg not loaded');
        return null;
      }

      try {
        setProgress(0);
        setError(null);

        const inputData = await fetchFile(inputBlob);
        await ffmpeg.writeFile('input.webm', inputData);

        await ffmpeg.exec([
          '-i', 'input.webm',
          '-ss', startTime.toString(),
          '-to', endTime.toString(),
          '-c', 'copy',
          'output.webm',
        ]);

        const outputData = await ffmpeg.readFile('output.webm');
        let outputBytes: Uint8Array<ArrayBuffer>;
        if (outputData instanceof Uint8Array) {
          // Copy into a fresh ArrayBuffer to avoid SharedArrayBuffer issues
          const ab = new ArrayBuffer(outputData.byteLength);
          const view = new Uint8Array(ab);
          view.set(outputData);
          outputBytes = view;
        } else {
          outputBytes = new TextEncoder().encode(outputData as string);
        }
        const outputBlob = new Blob([outputBytes], { type: 'video/webm' });

        // Cleanup
        await ffmpeg.deleteFile('input.webm');
        await ffmpeg.deleteFile('output.webm');

        setProgress(100);
        return outputBlob;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Trimming failed';
        setError(message);
        return null;
      }
    },
    [isLoaded]
  );

  return { isLoaded, isLoading, progress, error, load, trim };
}
