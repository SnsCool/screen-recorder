'use client';

import { useState, useRef, useCallback } from 'react';

export function useRecordingTimer() {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  const start = useCallback(() => {
    startTimeRef.current = Date.now() - pausedTimeRef.current * 1000;
    intervalRef.current = setInterval(() => {
      setElapsed((Date.now() - startTimeRef.current) / 1000);
    }, 100);
  }, []);

  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    pausedTimeRef.current = elapsed;
  }, [elapsed]);

  const resume = useCallback(() => {
    startTimeRef.current = Date.now() - pausedTimeRef.current * 1000;
    intervalRef.current = setInterval(() => {
      setElapsed((Date.now() - startTimeRef.current) / 1000);
    }, 100);
  }, []);

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setElapsed(0);
    pausedTimeRef.current = 0;
  }, []);

  return { elapsed, start, pause, resume, reset };
}
