-- Cloudflare D1 Database Schema for Feedback Intelligence

DROP TABLE IF EXISTS feedback;

CREATE TABLE feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL,              -- GitHub, Discord, Support, Email, Twitter, Forum
  team TEXT NOT NULL,                -- engineering, sales, pm, support, marketing, design
  message TEXT NOT NULL,             -- Raw feedback message
  theme TEXT NOT NULL,               -- performance, reliability, pricing, docs, feature, ui, compliance
  sentiment TEXT NOT NULL,           -- positive, neutral, negative
  region TEXT,                       -- US, EU, APAC, Global
  created_at TEXT NOT NULL,          -- ISO 8601 timestamp
  urgency INTEGER DEFAULT 5,         -- 1-10 scale
  impact INTEGER DEFAULT 5,          -- 1-10 scale (customer/revenue impact)
  frequency INTEGER DEFAULT 1,       -- How many times this issue reported
  status TEXT DEFAULT 'open',        -- open, in_progress, resolved
  days_open INTEGER DEFAULT 0        -- Days since reported
);

-- Indexes for common queries
CREATE INDEX idx_theme ON feedback(theme);
CREATE INDEX idx_team ON feedback(team);
CREATE INDEX idx_created_at ON feedback(created_at);
CREATE INDEX idx_sentiment ON feedback(sentiment);
CREATE INDEX idx_region ON feedback(region);
CREATE INDEX idx_status ON feedback(status);
CREATE INDEX idx_urgency ON feedback(urgency DESC);

-- Composite indexes for advanced queries
CREATE INDEX idx_theme_team ON feedback(theme, team);
CREATE INDEX idx_region_theme ON feedback(region, theme);
CREATE INDEX idx_status_days ON feedback(status, days_open);