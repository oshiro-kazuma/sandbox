defmodule HelloElixirPhoenix.Repo.Migrations.CreatePosts do
  use Ecto.Migration

  def change do
    create table(:posts) do
      add :user_id, :integer
      add :content, :string

      timestamps(type: :utc_datetime)
    end
  end
end
