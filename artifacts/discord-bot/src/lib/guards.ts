import { ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { STAFF_ROLE_ID, LOG_CHANNEL_ID } from '../config.js';

/** Returns the role IDs the interaction member has, handling both cached and API types. */
function getMemberRoleIds(member: GuildMember | { roles: string[] }): string[] {
  if (Array.isArray((member as { roles: string[] }).roles)) {
    return (member as { roles: string[] }).roles;
  }
  return [...(member as GuildMember).roles.cache.keys()];
}

/**
 * Checks that the command user:
 *   1. Has the staff role
 *   2. Is using the command in the designated log channel (unless skipChannelCheck = true)
 *
 * Returns true if all checks pass. Replies ephemerally and returns false otherwise.
 */
export async function checkPermissions(
  interaction: ChatInputCommandInteraction,
  skipChannelCheck = false,
): Promise<boolean> {
  const member = interaction.member;

  if (!member) {
    await interaction.reply({ content: '❌ Could not verify your roles.', ephemeral: true });
    return false;
  }

  const roleIds = getMemberRoleIds(member as GuildMember);

  if (!roleIds.includes(STAFF_ROLE_ID)) {
    await interaction.reply({
      content: '❌ You do not have permission to use this command.',
      ephemeral: true,
    });
    return false;
  }

  if (!skipChannelCheck && interaction.channelId !== LOG_CHANNEL_ID) {
    await interaction.reply({
      content: `❌ This command can only be used in <#${LOG_CHANNEL_ID}>.`,
      ephemeral: true,
    });
    return false;
  }

  return true;
}
