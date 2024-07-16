defmodule HelloElixirPhoenix.Repo do
  use Ecto.Repo,
    otp_app: :hello_elixir_phoenix,
    adapter: Ecto.Adapters.SQLite3
end
