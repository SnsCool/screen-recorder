'use client';

interface AudioIndicatorProps {
  level: number;
  isActive: boolean;
}

export function AudioIndicator({ level, isActive }: AudioIndicatorProps) {
  const bars = 5;

  return (
    <div className="flex items-end gap-0.5 h-4">
      {Array.from({ length: bars }).map((_, i) => {
        const threshold = (i + 1) / bars;
        const isLit = isActive && level >= threshold * 0.5;
        return (
          <div
            key={i}
            className={`w-1 rounded-full transition-all duration-75 ${
              isLit
                ? i < 2
                  ? 'bg-green-400'
                  : i < 4
                  ? 'bg-yellow-400'
                  : 'bg-red-400'
                : 'bg-gray-300'
            }`}
            style={{ height: `${((i + 1) / bars) * 100}%` }}
          />
        );
      })}
    </div>
  );
}
