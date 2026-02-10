'use client';

import { RecordingCard } from './RecordingCard';
import { EmptyState } from './EmptyState';
import type { Recording } from '@/types/recording';

interface RecordingListProps {
  recordings: Recording[];
  onDelete?: (id: string) => void;
  onRename?: (id: string, title: string) => void;
}

export function RecordingList({ recordings, onDelete, onRename }: RecordingListProps) {
  if (recordings.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {recordings.map((recording) => (
        <RecordingCard
          key={recording.id}
          recording={recording}
          onDelete={onDelete}
          onRename={onRename}
        />
      ))}
    </div>
  );
}
