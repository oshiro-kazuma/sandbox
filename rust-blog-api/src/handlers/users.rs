use axum::{extract::State, Json};

use crate::{
    error::{AppError, AppResult},
    jwt::AuthUser,
    models::{User, UserResponse},
    AppState,
};

/// 自分のプロフィール取得
#[utoipa::path(
    get,
    path = "/api/users/me",
    tag = "users",
    security(("bearer_auth" = [])),
    responses(
        (status = 200, description = "プロフィール", body = UserResponse),
        (status = 401, description = "未認証"),
    )
)]
pub async fn get_me(
    State(state): State<AppState>,
    auth: AuthUser,
) -> AppResult<Json<UserResponse>> {
    let user: User = sqlx::query_as("SELECT * FROM users WHERE id = ?")
        .bind(&auth.user_id)
        .fetch_optional(&state.db)
        .await?
        .ok_or(AppError::NotFound)?;
    Ok(Json(UserResponse::from(user)))
}
