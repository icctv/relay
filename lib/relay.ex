defmodule Relay do
  use Application

  @banner """

    (_) / __\\ / __\\/__   \\/\\   /\\
    | |/ /   / /     / /\\/\\ \\ / /
    | / /___/ /___  / /    \\ V /
    |_\\____/\\____/  \\/      \\_/

  """

  def start(_type, _args) do
    IO.puts(@banner)

    children = [
      Plug.Adapters.Cowboy.child_spec(:http, Relay.Router, [], port: 4000)
    ]

    Supervisor.start_link(children, strategy: :one_for_one)
  end
end
