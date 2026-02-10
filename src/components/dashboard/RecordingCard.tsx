'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Play, Trash2, Pencil, MoreVertical, Copy, Check } from 'lucide-react';
import { formatDuration } from '@/lib/utils/formatDuration';
import type { Recording } from '@/types/recording';

interface RecordingCardProps {
  recording: Recording;
  onDelete?: (id: string) => void;
  onRename?: (id: string, title: string) => void;
}

export function RecordingCard({ recording, onDelete, onRename }: RecordingCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(recording.title);
  const [copied, setCopied] = useState(false);

  const handleRename = () => {
    if (title.trim() && title !== recording.title) {
      onRename?.(recording.id, title.trim());
    }
    setIsEditing(false);
  };

  const handleCopyLink = async () => {
    if (recording.share_id) {
      await navigator.clipboard.writeText(`${window.location.origin}/watch/${recording.share_id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="group relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-colors">
      {/* Thumbnail */}
      <Link href={recording.share_id ? `/watch/${recording.share_id}` : '#'}>
        <div className="aspect-video bg-gray-800 relative">
          {recording.thumbnail_path ? (
            <img
              src={recording.thumbnail_path}
              alt={recording.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Play className="w-10 h-10 text-gray-600" />
            </div>
          )}
          {/* Duration badge */}
          <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 rounded text-xs text-white font-mono">
            {formatDuration(recording.duration_seconds)}
          </div>
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="white" />
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        {isEditing ? (
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            autoFocus
            className="w-full bg-gray-800 text-white text-sm font-medium rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        ) : (
          <h3 className="text-sm font-medium text-white truncate">{recording.title}</h3>
        )}
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
          <span>{new Date(recording.created_at).toLocaleDateString('ja-JP')}</span>
          <span>{recording.view_count} views</span>
        </div>
      </div>

      {/* Actions menu */}
      <div className="absolute top-2 right-2">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
            <div className="absolute top-10 right-0 z-20 bg-gray-800 rounded-lg shadow-xl overflow-hidden min-w-[160px]">
              <button
                onClick={() => { setIsEditing(true); setShowMenu(false); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                <Pencil className="w-4 h-4" />
                Rename
              </button>
              {recording.share_id && (
                <button
                  onClick={() => { handleCopyLink(); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  Copy Link
                </button>
              )}
              <button
                onClick={() => { onDelete?.(recording.id); setShowMenu(false); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-gray-700"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
