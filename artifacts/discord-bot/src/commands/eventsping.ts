import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  TextChannel,
} from 'discord.js';
import { checkPermissions } from '../lib/guards.js';
import { EVENTS_PING_CHANNEL_ID, EVENTS_PING_ROLE_ID } from '../config.js';

export const eventspingCommand = {
  data: new SlashCommandBuilder()
    .setName('eventsping')
    .setDescription('Ping the Events role in the events channel'),

  async execute(interaction: ChatInputCommandInteraction) {
    // Skip channel check — this command can be run from anywhere by staff
    if (!(await checkPermissions(interaction, true))) return;

    const channel = interaction.guild?.channels.cache.get(EVENTS_PING_CHANNEL_ID);

    if (!channel || !channel.isTextBased()) {
      return interaction.reply({
        content: '❌ Could not find the events channel. Make sure the bot has access to it.',
        ephemeral: true,
      });
    }

    await (channel as TextChannel).send(`<@&${EVENTS_PING_ROLE_ID}>`);

    return interaction.reply({
      content: `✅ Pinged <@&${EVENTS_PING_ROLE_ID}> in <#${EVENTS_PING_CHANNEL_ID}>!`,
      ephemeral: true,
    });
  },
};
