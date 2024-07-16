defmodule HelloElixirPhoenix.Timelines.Post do
  use Ecto.Schema
  import Ecto.Changeset

  schema "posts" do
    field :user_id, :integer
    field :content, :string

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(post, attrs) do
    post
    |> cast(attrs, [:user_id, :content])
    |> validate_required([:user_id, :content])
  end
end
