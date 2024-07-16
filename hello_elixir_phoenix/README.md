# HelloElixirPhoenix

To start your Phoenix server:

  * Run `mix setup` to install and setup dependencies
  * Start Phoenix endpoint with `mix phx.server` or inside IEx with `iex -S mix phx.server`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

Ready to run in production? Please [check our deployment guides](https://hexdocs.pm/phoenix/deployment.html).

## Learn more

  * Official website: https://www.phoenixframework.org/
  * Guides: https://hexdocs.pm/phoenix/overview.html
  * Docs: https://hexdocs.pm/phoenix
  * Forum: https://elixirforum.com/c/phoenix-forum
  * Source: https://github.com/phoenixframework/phoenix

------------------------------------

## install
```
# setup elixir
mise install elixir@1.17.2
mise use --global elixir@1.17.2

mise install erlang@27.0.1
mise use --global erlang@27.0.1

# setup project
mix archive.install hex phx_new
mix phx.new -v
Phoenix installer v1.7.14

mix phx.new hello_elixir_phoenix --database sqlite3

# run server
cd hello_elixir_phoenix
mix ecto.create
mix phx.server
iex -S mix phx.server

# sqlite
sqlite3 hello_elixir_phoenix_dev.db
.tables
.schema
```

```
We are almost there! The following steps are missing:

    $ cd hello_elixir_phoenix

Then configure your database in config/dev.exs and run:

    $ mix ecto.create

Start your Phoenix app with:

    $ mix phx.server

You can also run your app inside IEx (Interactive Elixir) as:

    $ iex -S mix phx.server
```

