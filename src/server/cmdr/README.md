# Cmdr Integration (minimal)

Structure:

- commands/debug/echo.ts — command definition
- commands/debug/echo.server.ts — server implementation
- bootstrap.server.ts — registry setup + simple Studio-only guard

Client:

- src/client/cmdr/bootstrap.client.ts — enables console in Studio, Backquote to open

Notes:

- We gate debug commands via a BeforeRun hook that blocks outside Studio for now.
- Expand with permissions/role checks later before shipping broader commands.
