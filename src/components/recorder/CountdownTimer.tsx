'use client';

import { useEffect, useState } from 'react';

interface CountdownTimerProps {
  from?: number;
  onComplete: () => void;
}

export function CountdownTimer({ from = 3, onComplete }: CountdownTimerProps) {
  const [count, setCount] = useState(from);

  useEffect(() => {
    if (count <= 0) {
      onComplete();
      return;
    }
    const timer = setTimeout(() => setCount(count - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="text-9xl font-bold text-white animate-pulse">
        {count}
      </div>
    </div>
  );
}
