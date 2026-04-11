CREATE TABLE IF NOT EXISTS users (
    id            TEXT PRIMARY KEY,
    username      TEXT NOT NULL UNIQUE,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'author',  -- 'admin' | 'author'
    created_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS posts (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    slug        TEXT NOT NULL UNIQUE,
    content     TEXT NOT NULL,
    author_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status      TEXT NOT NULL DEFAULT 'draft',  -- 'draft' | 'published'
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_status    ON posts(status);
