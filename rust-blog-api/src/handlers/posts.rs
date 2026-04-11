use axum::{
    extract::{Path, State},
    Json,
};
use chrono::Utc;
use uuid::Uuid;

use crate::{
    error::{AppError, AppResult},
    jwt::AuthUser,
    models::{CreatePostRequest, Post, UpdatePostRequest},
    AppState,
};

/// 公開済み投稿一覧
#[utoipa::path(
    get,
    path = "/api/posts",
    tag = "posts",
    responses(
        (status = 200, description = "投稿一覧", body = Vec<Post>),
    )
)]
pub async fn list_posts(State(state): State<AppState>) -> AppResult<Json<Vec<Post>>> {
    let posts = sqlx::query_as::<_, Post>(
        "SELECT * FROM posts WHERE status = 'published' ORDER BY created_at DESC",
    )
    .fetch_all(&state.db)
    .await?;
    Ok(Json(posts))
}

/// 投稿詳細（下書きは作成者 or admin のみ）
#[utoipa::path(
    get,
    path = "/api/posts/{id}",
    tag = "posts",
    params(("id" = String, Path, description = "投稿 ID")),
    responses(
        (status = 200, description = "投稿", body = Post),
        (status = 404, description = "見つからない"),
        (status = 403, description = "権限なし"),
    )
)]
pub async fn get_post(
    State(state): State<AppState>,
    maybe_user: Option<AuthUser>,
    Path(id): Path<String>,
) -> AppResult<Json<Post>> {
    let post: Post = sqlx::query_as("SELECT * FROM posts WHERE id = ?")
        .bind(&id)
        .fetch_optional(&state.db)
        .await?
        .ok_or(AppError::NotFound)?;

    if post.status == "draft" && maybe_user.is_none() {
        return Err(AppError::Forbidden);
    }

    Ok(Json(post))
}

/// 投稿作成（要認証）
#[utoipa::path(
    post,
    path = "/api/posts",
    tag = "posts",
    request_body = CreatePostRequest,
    security(("bearer_auth" = [])),
    responses(
        (status = 201, description = "作成成功", body = Post),
        (status = 401, description = "未認証"),
        (status = 409, description = "スラッグが既に存在する"),
    )
)]
pub async fn create_post(
    State(state): State<AppState>,
    auth: AuthUser,
    Json(body): Json<CreatePostRequest>,
) -> AppResult<(axum::http::StatusCode, Json<Post>)> {
    if body.title.trim().is_empty() || body.slug.trim().is_empty() {
        return Err(AppError::BadRequest("title と slug は必須です".to_string()));
    }

    let status = body.status.unwrap_or_else(|| "draft".to_string());
    if status != "draft" && status != "published" {
        return Err(AppError::BadRequest("status は 'draft' か 'published'".to_string()));
    }

    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    sqlx::query(
        "INSERT INTO posts (id, title, slug, content, author_id, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(&id)
    .bind(&body.title)
    .bind(&body.slug)
    .bind(&body.content)
    .bind(&auth.user_id)
    .bind(&status)
    .bind(&now)
    .bind(&now)
    .execute(&state.db)
    .await
    .map_err(|e| match e {
        sqlx::Error::Database(ref db_err) if db_err.message().contains("UNIQUE") => {
            AppError::Conflict("slug が既に使われています".to_string())
        }
        other => AppError::Database(other),
    })?;

    let post = Post {
        id,
        title: body.title,
        slug: body.slug,
        content: body.content,
        author_id: auth.user_id,
        status,
        created_at: now.clone(),
        updated_at: now,
    };
    Ok((axum::http::StatusCode::CREATED, Json(post)))
}

/// 投稿更新（作成者 or admin）
#[utoipa::path(
    put,
    path = "/api/posts/{id}",
    tag = "posts",
    params(("id" = String, Path, description = "投稿 ID")),
    request_body = UpdatePostRequest,
    security(("bearer_auth" = [])),
    responses(
        (status = 200, description = "更新成功", body = Post),
        (status = 401, description = "未認証"),
        (status = 403, description = "権限なし"),
        (status = 404, description = "見つからない"),
    )
)]
pub async fn update_post(
    State(state): State<AppState>,
    auth: AuthUser,
    Path(id): Path<String>,
    Json(body): Json<UpdatePostRequest>,
) -> AppResult<Json<Post>> {
    let post: Post = sqlx::query_as("SELECT * FROM posts WHERE id = ?")
        .bind(&id)
        .fetch_optional(&state.db)
        .await?
        .ok_or(AppError::NotFound)?;

    let title = body.title.unwrap_or(post.title);
    let slug = body.slug.unwrap_or(post.slug);
    let content = body.content.unwrap_or(post.content);
    let status = body.status.unwrap_or(post.status);
    let updated_at = Utc::now().to_rfc3339();

    sqlx::query(
        "UPDATE posts SET title = ?, slug = ?, content = ?, status = ?, updated_at = ?
         WHERE id = ?",
    )
    .bind(&title)
    .bind(&slug)
    .bind(&content)
    .bind(&status)
    .bind(&updated_at)
    .bind(&id)
    .execute(&state.db)
    .await?;

    Ok(Json(Post { id, title, slug, content, author_id: post.author_id, status, created_at: post.created_at, updated_at }))
}

/// 投稿削除（作成者 or admin）
#[utoipa::path(
    delete,
    path = "/api/posts/{id}",
    tag = "posts",
    params(("id" = String, Path, description = "投稿 ID")),
    security(("bearer_auth" = [])),
    responses(
        (status = 204, description = "削除成功"),
        (status = 401, description = "未認証"),
        (status = 403, description = "権限なし"),
        (status = 404, description = "見つからない"),
    )
)]
pub async fn delete_post(
    State(state): State<AppState>,
    auth: AuthUser,
    Path(id): Path<String>,
) -> AppResult<axum::http::StatusCode> {
    let post: Post = sqlx::query_as("SELECT * FROM posts WHERE id = ?")
        .bind(&id)
        .fetch_optional(&state.db)
        .await?
        .ok_or(AppError::NotFound)?;

    sqlx::query("DELETE FROM posts WHERE id = ?")
        .bind(&id)
        .execute(&state.db)
        .await?;

    Ok(axum::http::StatusCode::NO_CONTENT)
}
