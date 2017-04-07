# Import all plugins from `rel/plugins`
# They can then be used by adding `plugin MyPlugin` to
# either an environment, or release definition, where
# `MyPlugin` is the name of the plugin module.
Path.join(["rel", "plugins", "*.exs"])
|> Path.wildcard()
|> Enum.map(&Code.eval_file(&1))

use Mix.Releases.Config,
    # This sets the default release built by `mix release`
    default_release: :default,
    # This sets the default environment used by `mix release`
    default_environment: Mix.env()

# For a full list of config options for both releases
# and environments, visit https://hexdocs.pm/distillery/configuration.html


# You may define one or more environments in this file,
# an environment's settings will override those of a release
# when building in that environment, this combination of release
# and environment configuration is called a profile

environment :dev do
  set dev_mode: true
  set include_erts: false
  set cookie: :"%He11(uCjKjz?GwiF$<Xbam]lc{p1dA2nTpdgc|u>%!1,$=E?AE5G4XJUP2{6}/%"
end

environment :prod do
  set include_erts: true
  set include_src: false
  set cookie: :"o{sn`,JiJtYr3<[Woz|i&hDQ]O!BX]k.jllV$zA|(fPiG)SuPiQ/_=Mai5uu93dk"
end

# You may define one or more releases in this file.
# If you have not set a default release, or selected one
# when running `mix release`, the first release in the file
# will be used by default

release :relay do
  set version: current_version(:relay)
  set applications: [
    :runtime_tools
  ]
end
