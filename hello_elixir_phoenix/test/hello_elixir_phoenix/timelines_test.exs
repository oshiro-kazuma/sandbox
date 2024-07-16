defmodule HelloElixirPhoenix.TimelinesTest do
  use HelloElixirPhoenix.DataCase

  alias HelloElixirPhoenix.Timelines

  describe "posts" do
    alias HelloElixirPhoenix.Timelines.Post

    import HelloElixirPhoenix.TimelinesFixtures

    @invalid_attrs %{user_id: nil, content: nil}

    test "list_posts/0 returns all posts" do
      post = post_fixture()
      assert Timelines.list_posts() == [post]
    end

    test "get_post!/1 returns the post with given id" do
      post = post_fixture()
      assert Timelines.get_post!(post.id) == post
    end

    test "create_post/1 with valid data creates a post" do
      valid_attrs = %{user_id: 42, content: "some content"}

      assert {:ok, %Post{} = post} = Timelines.create_post(valid_attrs)
      assert post.user_id == 42
      assert post.content == "some content"
    end

    test "create_post/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Timelines.create_post(@invalid_attrs)
    end

    test "update_post/2 with valid data updates the post" do
      post = post_fixture()
      update_attrs = %{user_id: 43, content: "some updated content"}

      assert {:ok, %Post{} = post} = Timelines.update_post(post, update_attrs)
      assert post.user_id == 43
      assert post.content == "some updated content"
    end

    test "update_post/2 with invalid data returns error changeset" do
      post = post_fixture()
      assert {:error, %Ecto.Changeset{}} = Timelines.update_post(post, @invalid_attrs)
      assert post == Timelines.get_post!(post.id)
    end

    test "delete_post/1 deletes the post" do
      post = post_fixture()
      assert {:ok, %Post{}} = Timelines.delete_post(post)
      assert_raise Ecto.NoResultsError, fn -> Timelines.get_post!(post.id) end
    end

    test "change_post/1 returns a post changeset" do
      post = post_fixture()
      assert %Ecto.Changeset{} = Timelines.change_post(post)
    end
  end
end
