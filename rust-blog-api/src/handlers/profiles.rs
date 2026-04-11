use axum::{
    extract::{Path, State},
    Json,
};
use serde::Serialize;
use utoipa::ToSchema;

use crate::{
    error::{AppError, AppResult},
    models::{Post, User},
    AppState,
};

#[derive(Serialize, ToSchema)]
pub struct PublicProfile {
    pub username: String,
    pub url_path: String,
    pub posts: Vec<Post>,
}

/// ユーザー公開プロフィール（投稿一覧付き）
#[utoipa::path(
    get,
    path = "/api/u/{url_path}",
    tag = "profiles",
    params(
        ("url_path" = String, Path, description = "ユーザーの URL パス")
    ),
    responses(
        (status = 200, description = "公開プロフィール", body = PublicProfile),
        (status = 404, description = "見つからない"),
    )
)]
pub async fn get_profile(
    State(state): State<AppState>,
    Path(url_path): Path<String>,
) -> AppResult<Json<PublicProfile>> {
    let user: Option<User> =
        sqlx::query_as("SELECT * FROM users WHERE url_path = ?")
            .bind(&url_path)
            .fetch_optional(&state.db)
            .await?;

    let user = user.ok_or(AppError::NotFound)?;

    let posts: Vec<Post> = sqlx::query_as(
        "SELECT * FROM posts WHERE author_id = ? AND status = 'published' ORDER BY created_at DESC",
    )
    .bind(&user.id)
    .fetch_all(&state.db)
    .await?;

    Ok(Json(PublicProfile {
        url_path: user.url_path.unwrap_or_default(),
        username: user.username,
        posts,
    }))
}
