'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload } from 'tus-js-client';
import { createClient } from '@/lib/supabase/client';

interface UploadOptions {
  onProgress?: (progress: number) => void;
  onComplete?: (storagePath: string) => void;
  onError?: (error: string) => void;
}

export function useUpload(options: UploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const uploadRef = useRef<Upload | null>(null);

  const uploadFile = useCallback(
    async (file: Blob, storagePath: string, bucketName: string = 'recordings') => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // If no auth, use direct upload
        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          setError(uploadError.message);
          options.onError?.(uploadError.message);
          return null;
        }

        setProgress(100);
        options.onProgress?.(100);
        options.onComplete?.(storagePath);
        return storagePath;
      }

      return new Promise<string | null>((resolve) => {
        setIsUploading(true);
        setProgress(0);
        setError(null);

        const upload = new Upload(file, {
          endpoint: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/upload/resumable`,
          retryDelays: [0, 3000, 5000, 10000, 20000],
          headers: {
            authorization: `Bearer ${session.access_token}`,
          },
          uploadDataDuringCreation: true,
          removeFingerprintOnSuccess: true,
          metadata: {
            bucketName,
            objectName: storagePath,
            contentType: file.type || 'video/webm',
          },
          chunkSize: 6 * 1024 * 1024,
          onError: (err) => {
            const message = err.message || 'Upload failed';
            setError(message);
            setIsUploading(false);
            options.onError?.(message);
            resolve(null);
          },
          onProgress: (bytesUploaded, bytesTotal) => {
            const pct = Math.round((bytesUploaded / bytesTotal) * 100);
            setProgress(pct);
            options.onProgress?.(pct);
          },
          onSuccess: () => {
            setProgress(100);
            setIsUploading(false);
            options.onComplete?.(storagePath);
            resolve(storagePath);
          },
        });

        uploadRef.current = upload;
        upload.findPreviousUploads().then((previousUploads) => {
          if (previousUploads.length) {
            upload.resumeFromPreviousUpload(previousUploads[0]);
          }
          upload.start();
        });
      });
    },
    [options]
  );

  const pauseUpload = useCallback(() => {
    uploadRef.current?.abort();
  }, []);

  const resumeUpload = useCallback(() => {
    uploadRef.current?.start();
  }, []);

  return { uploadFile, isUploading, progress, error, pauseUpload, resumeUpload };
}
