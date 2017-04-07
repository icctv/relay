defmodule Relay.Router do
  use Plug.Router
  use Plug.Debugger, otp_app: :relay

  plug Plug.Logger
  plug Plug.Parsers, parsers: [:json, :urlencoded]
  plug :match
  plug :dispatch

  post "/in" do
    send_resp(conn, 200, "Thanks")
  end

  match _ do
    send_resp(conn, 404, "Not found")
  end
end
