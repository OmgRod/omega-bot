CREATE TABLE timers (
    id UUID PRIMARY KEY,        -- Unique identifier for the timer
    user_id TEXT NOT NULL,       -- The user the reminder is for
    created_by TEXT NOT NULL,    -- The user who created the reminder
    remind_for TEXT NOT NULL,    -- The user ID to be reminded
    text TEXT NOT NULL,          -- Reminder message
    time BIGINT NOT NULL,        -- Unix timestamp (milliseconds) for when the reminder should trigger
    completed BOOLEAN DEFAULT FALSE  -- Whether the timer has been completed
);

CREATE TABLE warnings (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  moderator_id TEXT NOT NULL,
  guild_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  date TIMESTAMP DEFAULT NOW()
);

-- CREATE TABLE wordle_games (
--     user_id TEXT NOT NULL,
--     word TEXT NOT NULL,
--     guesses TEXT DEFAULT '[]',
--     max_guesses INT NOT NULL DEFAULT 6,
--     started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     PRIMARY KEY (user_id)
-- );
