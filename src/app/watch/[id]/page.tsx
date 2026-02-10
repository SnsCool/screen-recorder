import { SharePanel } from '@/components/player/SharePanel';
import { Calendar, Eye, Clock } from 'lucide-react';
import Link from 'next/link';

interface WatchPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: WatchPageProps) {
  const { id } = await params;
  return {
    title: `Recording - Screen Recorder`,
    description: `Watch this screen recording`,
    openGraph: {
      title: `Screen Recording`,
      description: `Watch this screen recording`,
      type: 'video.other',
      url: `/watch/${id}`,
    },
  };
}

export default async function WatchPage({ params }: WatchPageProps) {
  const { id } = await params;

  // For now, this is a placeholder that works with local blobs
  // When Supabase is connected, this will fetch from the database
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent">
            Screen Recorder
          </Link>
          <Link
            href="/record"
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            New Recording
          </Link>
        </div>
      </header>

      {/* Video player area */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Player placeholder - will use actual video URL when Supabase is connected */}
          <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium">Recording: {id}</p>
              <p className="text-sm mt-2">Video player will load when connected to Supabase</p>
            </div>
          </div>

          {/* Video info */}
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-white">Screen Recording</h1>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date().toLocaleDateString('ja-JP')}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                0 views
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                0:00
              </span>
            </div>
          </div>

          {/* Share panel */}
          <SharePanel shareUrl={`/watch/${id}`} title="Screen Recording" />
        </div>
      </main>
    </div>
  );
}
