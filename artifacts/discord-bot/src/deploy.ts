/**
 * Deploy slash commands to the guild.
 * Run once whenever you add, rename, or change a command:
 *   pnpm --filter @workspace/discord-bot run deploy
 */
import { REST, Routes } from 'discord.js';
import { customroleCommand } from './commands/customrole.js';
import { eventroleCommand } from './commands/eventrole.js';
import { stanroleCommand } from './commands/stanrole.js';
import { giveawaypingCommand } from './commands/giveawayping.js';
import { eventspingCommand } from './commands/eventsping.js';
import { GUILD_ID } from './config.js';

const token = process.env.DISCORD_BOT_TOKEN;
const applicationId = process.env.DISCORD_APPLICATION_ID;

if (!token || !applicationId) {
  console.error('❌ Missing DISCORD_BOT_TOKEN or DISCORD_APPLICATION_ID');
  process.exit(1);
}

const commandData = [
  customroleCommand.data.toJSON(),
  eventroleCommand.data.toJSON(),
  stanroleCommand.data.toJSON(),
  giveawaypingCommand.data.toJSON(),
  eventspingCommand.data.toJSON(),
];

const rest = new REST().setToken(token);

console.log(`🚀 Registering ${commandData.length} slash command(s) to guild ${GUILD_ID}...`);

const data = (await rest.put(
  Routes.applicationGuildCommands(applicationId, GUILD_ID),
  { body: commandData },
)) as unknown[];

console.log(`✅ Successfully registered ${data.length} command(s).`);
