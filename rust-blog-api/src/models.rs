use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

// ── url_path validation ───────────────────────────────────────────────────────

const RESERVED_PATHS: &[&str] = &[
    "api", "admin", "login", "register", "dashboard",
    "uploads", "settings", "u", "me", "static",
];

/// url_path を正規化・検証して Some(normalized) を返す。
/// 3〜30 文字、英字始まり、英小文字/数字/ハイフン/アンダースコアのみ。
pub fn validate_url_path(raw: &str) -> Option<String> {
    let path = raw.trim().to_lowercase();
    if path.len() < 3 || path.len() > 30 {
        return None;
    }
    if !path.chars().next()?.is_ascii_alphabetic() {
        return None;
    }
    if !path.chars().all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '_') {
        return None;
    }
    if RESERVED_PATHS.contains(&path.as_str()) {
        return None;
    }
    Some(path)
}

// ── User ──────────────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct User {
    pub id: String,
    pub username: String,
    pub email: String,
    #[serde(skip_serializing)]
    pub password_hash: String,
    pub role: String,
    pub url_path: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct UserResponse {
    pub id: String,
    pub username: String,
    pub email: String,
    pub role: String,
    pub url_path: Option<String>,
    pub created_at: String,
}

impl From<User> for UserResponse {
    fn from(u: User) -> Self {
        Self {
            id: u.id,
            username: u.username,
            email: u.email,
            role: u.role,
            url_path: u.url_path,
            created_at: u.created_at,
        }
    }
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct RegisterRequest {
    pub username: String,
    pub email: String,
    pub password: String,
    /// URL パス（例: "alice" → /u/alice）。英字始まり・英小文字/数字/ハイフン/アンダースコア・3〜30文字
    pub url_path: String,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize, ToSchema)]
pub struct LoginResponse {
    pub token: String,
    pub user: UserResponse,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct UpdateProfileRequest {
    /// 新しい URL パス。英字始まり・英小文字/数字/ハイフン/アンダースコア・3〜30文字
    pub url_path: String,
}

// ── Post ──────────────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, ToSchema)]
pub struct Post {
    pub id: String,
    pub title: String,
    pub slug: String,
    pub content: String,
    pub author_id: String,
    /// "draft" | "published"
    pub status: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct CreatePostRequest {
    pub title: String,
    /// URL スラッグ（一意）
    pub slug: String,
    pub content: String,
    /// "draft" | "published"（省略時は "draft"）
    pub status: Option<String>,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct UpdatePostRequest {
    pub title: Option<String>,
    pub slug: Option<String>,
    pub content: Option<String>,
    /// "draft" | "published"
    pub status: Option<String>,
}
