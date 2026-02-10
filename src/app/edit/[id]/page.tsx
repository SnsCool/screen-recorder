'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { VideoEditor } from '@/components/editor/VideoEditor';
import { ArrowLeft } from 'lucide-react';

export default function EditPage() {
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    // Check for video blob in sessionStorage (passed from recording)
    const storedUrl = sessionStorage.getItem('editVideoUrl');
    if (storedUrl) {
      setVideoUrl(storedUrl);
      // Fetch the blob from the URL
      fetch(storedUrl)
        .then((r) => r.blob())
        .then((blob) => setVideoBlob(blob))
        .catch(console.error);
    }
  }, []);

  if (!videoUrl || !videoBlob) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-400 text-lg">No video to edit</p>
          <Link
            href="/record"
            className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go to Record
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/record"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-semibold text-white">Edit Recording</h1>
          </div>
        </div>
      </header>

      {/* Editor */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <VideoEditor videoBlob={videoBlob} videoUrl={videoUrl} />
      </main>
    </div>
  );
}
