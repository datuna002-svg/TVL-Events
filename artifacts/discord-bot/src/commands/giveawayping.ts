import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  TextChannel,
} from 'discord.js';
import { checkPermissions } from '../lib/guards.js';
import { GIVEAWAY_PING_CHANNEL_ID, GIVEAWAY_PING_ROLE_ID } from '../config.js';

export const giveawaypingCommand = {
  data: new SlashCommandBuilder()
    .setName('giveawayping')
    .setDescription('Ping the Giveaway role in the giveaway channel'),

  async execute(interaction: ChatInputCommandInteraction) {
    // Skip channel check — this command can be run from anywhere by staff
    if (!(await checkPermissions(interaction, true))) return;

    const channel = interaction.guild?.channels.cache.get(GIVEAWAY_PING_CHANNEL_ID);

    if (!channel || !channel.isTextBased()) {
      return interaction.reply({
        content: '❌ Could not find the giveaway channel. Make sure the bot has access to it.',
        ephemeral: true,
      });
    }

    await (channel as TextChannel).send(`<@&${GIVEAWAY_PING_ROLE_ID}>`);

    return interaction.reply({
      content: `✅ Pinged <@&${GIVEAWAY_PING_ROLE_ID}> in <#${GIVEAWAY_PING_CHANNEL_ID}>!`,
      ephemeral: true,
    });
  },
};
