CREATE TABLE career_attempts (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  challenge_id TEXT NOT NULL,
  topic TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'challenge',
  submitted_answer TEXT NOT NULL DEFAULT '',
  is_correct BOOLEAN NOT NULL DEFAULT false,
  points_earned INTEGER NOT NULL DEFAULT 0,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX career_attempts_user_created_idx ON career_attempts(user_id, created_at DESC);
CREATE INDEX career_attempts_user_topic_idx ON career_attempts(user_id, topic);