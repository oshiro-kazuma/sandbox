ALTER TABLE users ADD COLUMN url_path TEXT;
UPDATE users SET url_path = lower(username) WHERE url_path IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_url_path ON users(url_path);
