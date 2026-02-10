'use client';

import { useState, useCallback } from 'react';
import { Copy, Check, Link2, Code } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SharePanelProps {
  shareUrl: string;
  title: string;
}

export function SharePanel({ shareUrl, title }: SharePanelProps) {
  const [copied, setCopied] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);

  const fullUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${shareUrl}`
    : shareUrl;

  const embedCode = `<iframe src="${fullUrl}" width="640" height="360" frameborder="0" allowfullscreen></iframe>`;

  const copyToClipboard = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <div className="bg-gray-900 rounded-xl p-6 space-y-4">
      <h3 className="text-white font-semibold text-lg">Share &quot;{title}&quot;</h3>

      {/* Link */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
          <Link2 className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="text-sm text-gray-300 truncate">{fullUrl}</span>
        </div>
        <Button
          onClick={() => copyToClipboard(fullUrl)}
          variant="secondary"
          size="sm"
          className="shrink-0 gap-1.5"
        >
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>

      {/* Embed */}
      <button
        onClick={() => setShowEmbed(!showEmbed)}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <Code className="w-4 h-4" />
        Embed Code
      </button>

      {showEmbed && (
        <div className="space-y-2">
          <pre className="bg-gray-800 rounded-lg p-3 text-xs text-gray-300 overflow-x-auto">
            {embedCode}
          </pre>
          <Button
            onClick={() => copyToClipboard(embedCode)}
            variant="ghost"
            size="sm"
            className="gap-1.5"
          >
            <Copy className="w-3 h-3" />
            Copy Embed Code
          </Button>
        </div>
      )}
    </div>
  );
}
