import Link from 'next/link';
import { Monitor, Camera, Mic, Share2, Scissors, Play } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6">
        <div className="text-center max-w-3xl">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-red-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
            Screen Recorder
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-xl mx-auto">
            Record your screen with camera overlay, trim your videos, and share them with a link. No sign-up required.
          </p>
          <Link
            href="/record"
            className="inline-flex items-center gap-3 px-8 py-4 bg-red-500 hover:bg-red-600 text-white text-lg font-semibold rounded-2xl transition-all hover:scale-105 shadow-lg shadow-red-500/25"
          >
            <Monitor className="w-6 h-6" />
            Start Recording
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Camera, title: 'Camera Overlay', desc: 'Show your face in a circular overlay while recording' },
            { icon: Mic, title: 'Audio Recording', desc: 'Capture your microphone with noise suppression' },
            { icon: Scissors, title: 'Video Trimming', desc: 'Trim your recordings with a simple timeline editor' },
            { icon: Share2, title: 'Instant Sharing', desc: 'Share recordings with a unique link' },
            { icon: Play, title: 'Custom Player', desc: 'Beautiful playback with speed controls' },
            { icon: Monitor, title: 'Multiple Sources', desc: 'Record full screen, window, or browser tab' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-6 bg-gray-900 rounded-2xl border border-gray-800">
              <Icon className="w-8 h-8 text-red-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              <p className="text-gray-400 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
