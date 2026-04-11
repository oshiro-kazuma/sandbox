use axum::{extract::State, Json};

use crate::{
    error::AppResult,
    jwt::AdminUser,
    models::{User, UserResponse},
    AppState,
};

/// ユーザー一覧（admin 専用）
#[utoipa::path(
    get,
    path = "/api/users",
    tag = "users",
    security(("bearer_auth" = [])),
    responses(
        (status = 200, description = "ユーザー一覧", body = Vec<UserResponse>),
        (status = 401, description = "未認証"),
        (status = 403, description = "admin 以外は禁止"),
    )
)]
pub async fn list_users(
    State(state): State<AppState>,
    _admin: AdminUser,
) -> AppResult<Json<Vec<UserResponse>>> {
    let users: Vec<User> =
        sqlx::query_as("SELECT * FROM users ORDER BY created_at ASC")
            .fetch_all(&state.db)
            .await?;

    Ok(Json(users.into_iter().map(UserResponse::from).collect()))
}
