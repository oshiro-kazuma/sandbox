use argon2::{
    password_hash::{PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use rand_core::OsRng;
use axum::{extract::State, Json};
use chrono::Utc;
use uuid::Uuid;

use crate::{
    error::{AppError, AppResult},
    jwt::create_token,
    models::{validate_url_path, LoginRequest, LoginResponse, RegisterRequest, User, UserResponse},
    AppState,
};

/// ユーザー登録
#[utoipa::path(
    post,
    path = "/api/auth/register",
    tag = "auth",
    request_body = RegisterRequest,
    responses(
        (status = 201, description = "登録成功", body = UserResponse),
        (status = 409, description = "メールアドレス・ユーザー名・url_path が重複"),
        (status = 400, description = "バリデーションエラー"),
    )
)]
pub async fn register(
    State(state): State<AppState>,
    Json(body): Json<RegisterRequest>,
) -> AppResult<(axum::http::StatusCode, Json<UserResponse>)> {
    if body.username.trim().is_empty() || body.email.trim().is_empty() || body.password.len() < 8 {
        return Err(AppError::BadRequest(
            "username と email は必須、password は8文字以上".to_string(),
        ));
    }

    let url_path = validate_url_path(&body.url_path).ok_or_else(|| {
        AppError::BadRequest(
            "url_path は英字始まり・英小文字/数字/ハイフン/アンダースコア・3〜30文字".to_string(),
        )
    })?;

    let salt = SaltString::generate(&mut OsRng);
    let password_hash = Argon2::default()
        .hash_password(body.password.as_bytes(), &salt)
        .map_err(|_| AppError::PasswordHash)?
        .to_string();

    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM users")
        .fetch_one(&state.db)
        .await?;
    let role = if count == 0 { "admin" } else { "author" };

    sqlx::query(
        "INSERT INTO users (id, username, email, password_hash, role, url_path, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(&id)
    .bind(&body.username)
    .bind(&body.email)
    .bind(&password_hash)
    .bind(role)
    .bind(&url_path)
    .bind(&now)
    .execute(&state.db)
    .await
    .map_err(|e| match e {
        sqlx::Error::Database(ref db_err) if db_err.message().contains("UNIQUE") => {
            AppError::Conflict(
                "username・email・url_path のいずれかが既に使われています".to_string(),
            )
        }
        other => AppError::Database(other),
    })?;

    let user = UserResponse {
        id,
        username: body.username,
        email: body.email,
        role: role.to_string(),
        url_path: Some(url_path),
        created_at: now,
    };
    Ok((axum::http::StatusCode::CREATED, Json(user)))
}

/// ログイン（JWT 発行）
#[utoipa::path(
    post,
    path = "/api/auth/login",
    tag = "auth",
    request_body = LoginRequest,
    responses(
        (status = 200, description = "ログイン成功", body = LoginResponse),
        (status = 401, description = "認証失敗"),
    )
)]
pub async fn login(
    State(state): State<AppState>,
    Json(body): Json<LoginRequest>,
) -> AppResult<Json<LoginResponse>> {
    let user: User = sqlx::query_as("SELECT * FROM users WHERE email = ?")
        .bind(&body.email)
        .fetch_optional(&state.db)
        .await?
        .ok_or(AppError::Unauthorized)?;

    let parsed_hash = PasswordHash::new(&user.password_hash).map_err(|_| AppError::PasswordHash)?;
    Argon2::default()
        .verify_password(body.password.as_bytes(), &parsed_hash)
        .map_err(|_| AppError::Unauthorized)?;

    let token = create_token(&user.id, &user.role, &state.jwt_secret)?;
    Ok(Json(LoginResponse { token, user: user.into() }))
}
