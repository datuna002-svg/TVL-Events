import { Client, GatewayIntentBits, Collection, Events } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import { customroleCommand } from './commands/customrole.js';
import { eventroleCommand } from './commands/eventrole.js';
import { stanroleCommand } from './commands/stanrole.js';
import { giveawaypingCommand } from './commands/giveawayping.js';
import { eventspingCommand } from './commands/eventsping.js';

interface Command {
  data: { name: string; toJSON(): unknown };
  execute(interaction: ChatInputCommandInteraction): Promise<unknown>;
}

// ── Client setup ─────────────────────────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers, // needed for member.roles.cache lookups
  ],
});

// ── Command registry ─────────────────────────────────────────────────────────
const commands = new Collection<string, Command>();
const allCommands: Command[] = [
  customroleCommand,
  eventroleCommand,
  stanroleCommand,
  giveawaypingCommand,
  eventspingCommand,
];

for (const cmd of allCommands) {
  commands.set(cmd.data.name, cmd as Command);
}

// ── Events ────────────────────────────────────────────────────────────────────
client.once(Events.ClientReady, (c) => {
  console.log(`✅ Bot ready! Logged in as ${c.user.tag}`);
  console.log(`📦 Loaded commands: ${[...commands.keys()].join(', ')}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);
  if (!command) {
    console.warn(`Unknown command received: ${interaction.commandName}`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error in /${interaction.commandName}:`, error);
    const payload = {
      content: '❌ An unexpected error occurred. Please try again.',
      ephemeral: true,
    };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(payload).catch(console.error);
    } else {
      await interaction.reply(payload).catch(console.error);
    }
  }
});

// ── Login ─────────────────────────────────────────────────────────────────────
const token = process.env.DISCORD_BOT_TOKEN;
if (!token) {
  console.error('❌ Missing DISCORD_BOT_TOKEN environment variable');
  process.exit(1);
}

client.login(token).catch((err) => {
  console.error('❌ Failed to log in:', err);
  process.exit(1);
});
