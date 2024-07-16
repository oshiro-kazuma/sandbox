defmodule HelloElixirPhoenix.TimelinesFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `HelloElixirPhoenix.Timelines` context.
  """

  @doc """
  Generate a post.
  """
  def post_fixture(attrs \\ %{}) do
    {:ok, post} =
      attrs
      |> Enum.into(%{
        content: "some content",
        user_id: 42
      })
      |> HelloElixirPhoenix.Timelines.create_post()

    post
  end
end
