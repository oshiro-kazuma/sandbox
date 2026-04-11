use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

// ── User ──────────────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct User {
    pub id: String,
    pub username: String,
    pub email: String,
    #[serde(skip_serializing)]
    pub password_hash: String,
    pub role: String,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct UserResponse {
    pub id: String,
    pub username: String,
    pub email: String,
    pub created_at: String,
}

impl From<User> for UserResponse {
    fn from(u: User) -> Self {
        Self { id: u.id, username: u.username, email: u.email, created_at: u.created_at }
    }
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct RegisterRequest {
    pub username: String,
    pub email: String,
    pub password: String,
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

// ── Post ──────────────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, ToSchema)]
pub struct Post {
    pub id: String,
    pub title: String,
    pub slug: String,
    pub content: String,
    pub author_id: String,
    pub status: String,
    pub created_at: String,
    pub updated_at: String,
    pub location: Option<String>,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct CreatePostRequest {
    pub title: String,
    pub slug: String,
    pub content: String,
    pub status: Option<String>,
    pub location: Option<String>,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct UpdatePostRequest {
    pub title: Option<String>,
    pub slug: Option<String>,
    pub content: Option<String>,
    pub status: Option<String>,
    pub location: Option<String>,
}
