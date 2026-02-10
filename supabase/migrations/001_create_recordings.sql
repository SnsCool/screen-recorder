-- Create recordings table
CREATE TABLE IF NOT EXISTS recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  title TEXT NOT NULL DEFAULT 'Untitled Recording',
  description TEXT,
  duration_seconds NUMERIC(10, 2),
  file_size_bytes BIGINT,

  storage_path TEXT NOT NULL,
  thumbnail_path TEXT,

  share_id TEXT UNIQUE,
  is_public BOOLEAN NOT NULL DEFAULT false,

  trim_start_seconds NUMERIC(10, 2),
  trim_end_seconds NUMERIC(10, 2),
  original_storage_path TEXT,

  has_camera BOOLEAN DEFAULT false,
  has_microphone BOOLEAN DEFAULT false,
  capture_type TEXT CHECK (capture_type IN ('screen', 'window', 'tab')),
  resolution TEXT,

  view_count INTEGER NOT NULL DEFAULT 0,

  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recordings_user_id ON recordings(user_id);
CREATE INDEX IF NOT EXISTS idx_recordings_share_id ON recordings(share_id);
CREATE INDEX IF NOT EXISTS idx_recordings_created_at ON recordings(created_at DESC);

-- Create recording views table
CREATE TABLE IF NOT EXISTS recording_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id UUID NOT NULL REFERENCES recordings(id) ON DELETE CASCADE,
  viewer_ip TEXT,
  viewer_user_agent TEXT,
  watched_seconds NUMERIC(10, 2),
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recording_views_recording_id ON recording_views(recording_id);

-- Enable RLS
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE recording_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own recordings" ON recordings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public recordings are viewable" ON recordings
  FOR SELECT USING (is_public = true);

CREATE POLICY "Anyone can create views" ON recording_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Owners can view analytics" ON recording_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM recordings
      WHERE recordings.id = recording_views.recording_id
      AND recordings.user_id = auth.uid()
    )
  );

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recordings_updated_at
  BEFORE UPDATE ON recordings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Increment view count function
CREATE OR REPLACE FUNCTION increment_view_count(recording_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE recordings SET view_count = view_count + 1 WHERE id = recording_uuid;
END;
$$ LANGUAGE plpgsql;
