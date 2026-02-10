'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { RecordingList } from '@/components/dashboard/RecordingList';
import { toast, ToastContainer } from '@/components/ui/Toast';
import type { Recording } from '@/types/recording';

export default function DashboardPage() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRecordings = useCallback(async () => {
    try {
      const res = await fetch('/api/recordings');
      if (res.ok) {
        const data = await res.json();
        setRecordings(data);
      }
    } catch {
      toast('Failed to load recordings', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecordings();
  }, [fetchRecordings]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to delete this recording?')) return;

    try {
      const res = await fetch(`/api/recordings/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRecordings((prev) => prev.filter((r) => r.id !== id));
        toast('Recording deleted', 'success');
      } else {
        toast('Failed to delete recording', 'error');
      }
    } catch {
      toast('Failed to delete recording', 'error');
    }
  }, []);

  const handleRename = useCallback(async (id: string, title: string) => {
    try {
      const res = await fetch(`/api/recordings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (res.ok) {
        setRecordings((prev) =>
          prev.map((r) => (r.id === id ? { ...r, title } : r))
        );
        toast('Recording renamed', 'success');
      }
    } catch {
      toast('Failed to rename recording', 'error');
    }
  }, []);

  const filteredRecordings = searchQuery
    ? recordings.filter((r) =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : recordings;

  return (
    <div className="min-h-screen bg-gray-950">
      <ToastContainer />

      {/* Header */}
      <header className="border-b border-gray-800 sticky top-0 bg-gray-950/95 backdrop-blur z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent"
          >
            Screen Recorder
          </Link>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search recordings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent w-64"
              />
            </div>

            <Link
              href="/record"
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Recording
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">My Recordings</h1>
          <span className="text-sm text-gray-500">
            {recordings.length} recording{recordings.length !== 1 ? 's' : ''}
          </span>
        </div>

        {isLoading ? (
          /* Loading skeleton */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 animate-pulse">
                <div className="aspect-video bg-gray-800" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-800 rounded w-3/4" />
                  <div className="h-3 bg-gray-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <RecordingList
            recordings={filteredRecordings}
            onDelete={handleDelete}
            onRename={handleRename}
          />
        )}
      </main>
    </div>
  );
}
