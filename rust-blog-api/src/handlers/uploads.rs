use axum::{extract::{Multipart, State}, Json};
use serde::Serialize;
use std::path::Path;
use utoipa::ToSchema;
use uuid::Uuid;

use crate::{error::{AppError, AppResult}, jwt::AuthUser, AppState};

const ALLOWED_EXTS: &[&str] = &["jpg", "jpeg", "png", "gif", "webp"];

#[derive(Serialize, ToSchema)]
pub struct UploadResponse {
    /// フロントエンドからそのまま Markdown に埋め込める URL
    pub url: String,
}

/// 画像アップロード（要認証）
#[utoipa::path(
    post,
    path = "/api/uploads",
    tag = "uploads",
    request_body(content_type = "multipart/form-data", description = "file フィールドに画像を添付"),
    security(("bearer_auth" = [])),
    responses(
        (status = 200, description = "アップロード成功", body = UploadResponse),
        (status = 400, description = "非対応ファイル形式"),
        (status = 401, description = "未認証"),
    )
)]
pub async fn upload_image(
    State(state): State<AppState>,
    _auth: AuthUser,
    mut multipart: Multipart,
) -> AppResult<Json<UploadResponse>> {
    while let Some(field) = multipart.next_field().await? {
        if field.name() != Some("file") {
            continue;
        }

        let original_name = field.file_name().unwrap_or("upload").to_string();
        let ext = Path::new(&original_name)
            .extension()
            .and_then(|e| e.to_str())
            .unwrap_or("")
            .to_lowercase();

        if !ALLOWED_EXTS.contains(&ext.as_str()) {
            return Err(AppError::BadRequest(
                format!("非対応の形式です。対応: {}", ALLOWED_EXTS.join(", ")),
            ));
        }

        let data = field.bytes().await?;
        let filename = format!("{}.{}", Uuid::new_v4(), ext);
        let path = format!("{}/{}", state.upload_dir, filename);

        tokio::fs::write(&path, &data).await?;

        return Ok(Json(UploadResponse {
            url: format!("/uploads/{}", filename),
        }));
    }

    Err(AppError::BadRequest("file フィールドが見つかりません".to_string()))
}
