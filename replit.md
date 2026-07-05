# TVB Events Discord Bot

A Discord.js (TypeScript) bot for the TVB Events server that manages custom roles, event winner roles, Stan roles, and event/giveaway pings.

## Run & Operate

- **Discord Bot workflow** — runs the bot (`pnpm --filter @workspace/discord-bot run dev`)
- `pnpm --filter @workspace/discord-bot run deploy` — re-register slash commands with Discord (run after adding/renaming commands)
- `pnpm --filter @workspace/discord-bot run typecheck` — typecheck the bot
- Required secrets: `DISCORD_BOT_TOKEN`, `DISCORD_APPLICATION_ID`, `DISCORD_CLIENT_ID`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

_Populate as you build — short repo map plus pointers to the source-of-truth file for DB schema, API contracts, theme files, etc._

## Architecture decisions

_Populate as you build — non-obvious choices a reader couldn't infer from the code (3-5 bullets)._

## Product

_Describe the high-level user-facing capabilities of this app once they exist._

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
