CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  full_name TEXT NOT NULL,
  university TEXT DEFAULT '',
  department TEXT DEFAULT 'CSE',
  year_level TEXT DEFAULT 'Final-year',
  contact TEXT DEFAULT '',
  source TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'prospect',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS customers_user_created_idx ON customers(user_id, created_at DESC);
CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  interview_date DATE NOT NULL DEFAULT CURRENT_DATE,
  recent_experience TEXT DEFAULT '',
  main_problem TEXT DEFAULT '',
  trigger_event TEXT DEFAULT '',
  workaround TEXT DEFAULT '',
  time_spent TEXT DEFAULT '',
  money_spent TEXT DEFAULT '',
  satisfaction TEXT DEFAULT '',
  what_works TEXT DEFAULT '',
  improvement_needed TEXT DEFAULT '',
  exact_quote TEXT DEFAULT '',
  next_question TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS interviews_user_date_idx ON interviews(user_id, interview_date DESC);
CREATE TABLE IF NOT EXISTS business_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  prompt_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started',
  notes TEXT DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, prompt_number)
);