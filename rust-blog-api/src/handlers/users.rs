use axum::{extract::State, Json};

use crate::{
    error::{AppError, AppResult},
    jwt::{AdminUser, AuthUser},
    models::{validate_url_path, UpdateProfileRequest, User, UserResponse},
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

/// url_path を更新
#[utoipa::path(
    patch,
    path = "/api/users/me",
    tag = "users",
    request_body = UpdateProfileRequest,
    security(("bearer_auth" = [])),
    responses(
        (status = 200, description = "更新後プロフィール", body = UserResponse),
        (status = 400, description = "url_path バリデーションエラー"),
        (status = 401, description = "未認証"),
        (status = 409, description = "url_path が重複"),
    )
)]
pub async fn update_me(
    State(state): State<AppState>,
    auth: AuthUser,
    Json(body): Json<UpdateProfileRequest>,
) -> AppResult<Json<UserResponse>> {
    let url_path = validate_url_path(&body.url_path).ok_or_else(|| {
        AppError::BadRequest(
            "url_path は英字始まり・英小文字/数字/ハイフン/アンダースコア・3〜30文字".to_string(),
        )
    })?;

    sqlx::query("UPDATE users SET url_path = ? WHERE id = ?")
        .bind(&url_path)
        .bind(&auth.user_id)
        .execute(&state.db)
        .await
        .map_err(|e| match e {
            sqlx::Error::Database(ref db_err) if db_err.message().contains("UNIQUE") => {
                AppError::Conflict("この URL パスはすでに使われています".to_string())
            }
            other => AppError::Database(other),
        })?;

    let user: User = sqlx::query_as("SELECT * FROM users WHERE id = ?")
        .bind(&auth.user_id)
        .fetch_optional(&state.db)
        .await?
        .ok_or(AppError::NotFound)?;

    Ok(Json(UserResponse::from(user)))
}
