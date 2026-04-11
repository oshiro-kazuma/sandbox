use axum::{
    routing::{get, patch, post},
    Router,
};
use sqlx::sqlite::SqlitePoolOptions;
use tower_http::{cors::CorsLayer, services::ServeDir};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use utoipa::{
    openapi::security::{HttpAuthScheme, HttpBuilder, SecurityScheme},
    Modify, OpenApi,
};
use utoipa_swagger_ui::SwaggerUi;

mod error;
mod handlers;
mod jwt;
mod models;

// ── AppState ──────────────────────────────────────────────────────────────────

#[derive(Clone)]
pub struct AppState {
    pub db: sqlx::SqlitePool,
    pub jwt_secret: String,
    pub upload_dir: String,
}

// ── OpenAPI ───────────────────────────────────────────────────────────────────

struct BearerAuth;
impl Modify for BearerAuth {
    fn modify(&self, openapi: &mut utoipa::openapi::OpenApi) {
        if let Some(components) = openapi.components.as_mut() {
            components.add_security_scheme(
                "bearer_auth",
                SecurityScheme::Http(
                    HttpBuilder::new()
                        .scheme(HttpAuthScheme::Bearer)
                        .bearer_format("JWT")
                        .build(),
                ),
            );
        }
    }
}

#[derive(OpenApi)]
#[openapi(
    info(
        title = "Headless Blog CMS",
        description = "Axum + SQLite で作る複数ユーザー対応ブログ API",
        version = "0.1.0"
    ),
    paths(
        handlers::auth::register,
        handlers::auth::login,
        handlers::posts::list_posts,
        handlers::posts::get_post,
        handlers::posts::create_post,
        handlers::posts::update_post,
        handlers::posts::delete_post,
        handlers::users::list_users,
        handlers::users::get_me,
        handlers::users::update_me,
        handlers::profiles::get_profile,
        handlers::uploads::upload_image,
    ),
    components(schemas(
        models::RegisterRequest,
        models::LoginRequest,
        models::LoginResponse,
        models::UserResponse,
        models::UpdateProfileRequest,
        models::Post,
        models::CreatePostRequest,
        models::UpdatePostRequest,
        handlers::uploads::UploadResponse,
        handlers::profiles::PublicProfile,
    )),
    modifiers(&BearerAuth),
    tags(
        (name = "auth",     description = "認証"),
        (name = "posts",    description = "投稿 CRUD"),
        (name = "users",    description = "ユーザー管理"),
        (name = "profiles", description = "公開プロフィール"),
        (name = "uploads",  description = "画像アップロード"),
    )
)]
struct ApiDoc;

// ── main ──────────────────────────────────────────────────────────────────────

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG")
                .unwrap_or_else(|_| "rust_blog_api=debug,tower_http=debug".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let database_url =
        std::env::var("DATABASE_URL").unwrap_or_else(|_| "sqlite:blog.db".to_string());
    let jwt_secret =
        std::env::var("JWT_SECRET").unwrap_or_else(|_| "change-me-in-production".to_string());
    let upload_dir =
        std::env::var("UPLOAD_DIR").unwrap_or_else(|_| "./uploads".to_string());

    tokio::fs::create_dir_all(&upload_dir)
        .await
        .expect("アップロードディレクトリの作成失敗");

    let db = SqlitePoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .expect("DB 接続失敗");

    sqlx::migrate!("./migrations")
        .run(&db)
        .await
        .expect("マイグレーション失敗");

    let state = AppState { db, jwt_secret, upload_dir: upload_dir.clone() };

    let app = Router::new()
        .merge(SwaggerUi::new("/api-docs").url("/api-docs/openapi.json", ApiDoc::openapi()))
        .nest_service("/uploads", ServeDir::new(&upload_dir))
        .nest("/api", api_routes())
        .with_state(state)
        .layer(CorsLayer::permissive());

    let addr = "0.0.0.0:3000";
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    tracing::info!("Listening on http://{addr}");
    tracing::info!("Swagger UI → http://{addr}/api-docs");
    axum::serve(listener, app).await.unwrap();
}

// ── routes ────────────────────────────────────────────────────────────────────

fn api_routes() -> Router<AppState> {
    Router::new()
        // auth
        .route("/auth/register", post(handlers::auth::register))
        .route("/auth/login",    post(handlers::auth::login))
        // posts
        .route("/posts",     get(handlers::posts::list_posts).post(handlers::posts::create_post))
        .route("/posts/:id", get(handlers::posts::get_post)
                                 .put(handlers::posts::update_post)
                                 .delete(handlers::posts::delete_post))
        // users
        .route("/users",    get(handlers::users::list_users))
        .route("/users/me", get(handlers::users::get_me).patch(handlers::users::update_me))
        // public profiles
        .route("/u/:url_path", get(handlers::profiles::get_profile))
        // uploads
        .route("/uploads", post(handlers::uploads::upload_image))
}
