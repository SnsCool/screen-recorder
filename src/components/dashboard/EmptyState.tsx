import Link from 'next/link';
import { Monitor } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6">
        <Monitor className="w-10 h-10 text-gray-600" />
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">No recordings yet</h2>
      <p className="text-gray-400 mb-8 max-w-md">
        Start your first screen recording. It only takes a click.
      </p>
      <Link
        href="/record"
        className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors"
      >
        Start Recording
      </Link>
    </div>
  );
}
