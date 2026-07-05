import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  Role,
} from 'discord.js';
import { checkPermissions } from '../lib/guards.js';
import {
  STAFF_ROLE_ID,
  STAN_ROLE_ID_SET,
  EVENT_WINNER_ROLE_ID_SET,
  EVENTS_PING_ROLE_ID,
  GIVEAWAY_PING_ROLE_ID,
} from '../config.js';

/** Roles that must never be deleted by /customrole remove. */
const PROTECTED_ROLE_IDS = new Set([
  STAFF_ROLE_ID,
  EVENTS_PING_ROLE_ID,
  GIVEAWAY_PING_ROLE_ID,
]);

function isProtected(role: Role): boolean {
  if (PROTECTED_ROLE_IDS.has(role.id)) return true;
  if (STAN_ROLE_ID_SET.has(role.id)) return true;
  if (EVENT_WINNER_ROLE_ID_SET.has(role.id)) return true;
  if (role.managed) return true; // bot/integration-managed roles
  if (role.id === role.guild.id) return true; // @everyone
  return false;
}

function parseColor(input: string): number | null {
  const hex = input.replace('#', '').trim();
  if (!/^[0-9A-Fa-f]{6}$/.test(hex)) return null;
  return parseInt(hex, 16);
}

export const customroleCommand = {
  data: new SlashCommandBuilder()
    .setName('customrole')
    .setDescription('Manage custom roles')
    .addSubcommand((sub) =>
      sub
        .setName('create')
        .setDescription('Create a custom role and assign it to a user')
        .addUserOption((opt) =>
          opt.setName('user').setDescription('The user to receive the role').setRequired(true),
        )
        .addStringOption((opt) =>
          opt.setName('name').setDescription('Role name').setRequired(true),
        )
        .addStringOption((opt) =>
          opt
            .setName('color')
            .setDescription('Role color as hex (e.g. FF0000 or #FF0000)')
            .setRequired(true),
        )
        .addAttachmentOption((opt) =>
          opt.setName('icon').setDescription('Role icon image (optional)').setRequired(false),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName('remove')
        .setDescription("Remove a custom role from a user and delete it from the server")
        .addUserOption((opt) =>
          opt.setName('user').setDescription('The user').setRequired(true),
        )
        .addRoleOption((opt) =>
          opt
            .setName('role')
            .setDescription('The custom role to remove and delete')
            .setRequired(true),
        ),
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!(await checkPermissions(interaction))) return;

    const sub = interaction.options.getSubcommand();
    const guild = interaction.guild!;

    // ── CREATE ──────────────────────────────────────────────────────────────
    if (sub === 'create') {
      const targetUser = interaction.options.getUser('user', true);
      const name = interaction.options.getString('name', true);
      const colorStr = interaction.options.getString('color', true);
      const iconAttachment = interaction.options.getAttachment('icon');

      const color = parseColor(colorStr);
      if (color === null) {
        return interaction.reply({
          content: '❌ Invalid color. Use a hex value like `FF0000` or `#FF0000`.',
          ephemeral: true,
        });
      }

      if (iconAttachment && !iconAttachment.contentType?.startsWith('image/')) {
        return interaction.reply({
          content: '❌ The icon must be an image file (PNG, JPG, GIF, etc.).',
          ephemeral: true,
        });
      }

      await interaction.deferReply();

      const member = await guild.members.fetch(targetUser.id).catch(() => null);
      if (!member) {
        return interaction.editReply('❌ Could not find that user in this server.');
      }

      // Build role creation options
      type RoleCreateOptions = Parameters<typeof guild.roles.create>[0];
      const roleOptions: RoleCreateOptions = {
        name,
        color,
        reason: `Custom role created by ${interaction.user.tag}`,
      };

      if (iconAttachment) roleOptions.icon = iconAttachment.url;

      let role;
      let iconWarning = false;

      try {
        role = await guild.roles.create(roleOptions);
      } catch {
        // Server may not have boost level for icons — retry without
        if (iconAttachment) {
          delete roleOptions.icon;
          iconWarning = true;
          try {
            role = await guild.roles.create(roleOptions);
          } catch (err2) {
            return interaction.editReply(
              `❌ Failed to create role: ${(err2 as Error).message}`,
            );
          }
        } else {
          return interaction.editReply(`❌ Failed to create role. Check bot permissions.`);
        }
      }

      try {
        await member.roles.add(role, `Custom role assigned by ${interaction.user.tag}`);
      } catch (err) {
        await role.delete('Cleanup after failed assignment').catch(() => null);
        return interaction.editReply(
          `❌ Role created but could not be assigned: ${(err as Error).message}`,
        );
      }

      const hexDisplay = `#${color.toString(16).padStart(6, '0').toUpperCase()}`;
      const embedCreate = new EmbedBuilder()
        .setTitle('✅ Custom Role Created')
        .setColor(color)
        .addFields(
          { name: 'User', value: `<@${targetUser.id}>`, inline: true },
          { name: 'Role', value: `<@&${role.id}>`, inline: true },
          { name: 'Color', value: hexDisplay, inline: true },
        )
        .setFooter({ text: `Created by ${interaction.user.tag}` })
        .setTimestamp();

      await interaction.editReply({ embeds: [embedCreate] });

      if (iconWarning) {
        await interaction.followUp({
          content:
            '⚠️ Could not apply the icon (server needs Level 2 boost for role icons). Role was created without it.',
          ephemeral: true,
        });
      }

      return;

    // ── REMOVE ──────────────────────────────────────────────────────────────
    } else if (sub === 'remove') {
      const targetUser = interaction.options.getUser('user', true);
      const roleOption = interaction.options.getRole('role', true);

      // Fetch the full Role object so we can check managed/hierarchy and delete safely
      const guildRole = await guild.roles.fetch(roleOption.id).catch(() => null);
      if (!guildRole) {
        return interaction.reply({ content: '❌ Could not find that role in this server.', ephemeral: true });
      }

      // Guard: refuse to delete protected roles (staff, stan, event winner, @everyone, managed)
      if (isProtected(guildRole)) {
        return interaction.reply({
          content: '❌ That role is protected and cannot be removed with this command.',
          ephemeral: true,
        });
      }

      // Guard: bot must be higher in the hierarchy than the role to delete it
      const botMember = await guild.members.fetchMe().catch(() => null);
      if (botMember && guildRole.position >= botMember.roles.highest.position) {
        return interaction.reply({
          content: '❌ That role is higher than or equal to the bot\'s highest role — cannot delete it.',
          ephemeral: true,
        });
      }

      await interaction.deferReply();

      const member = await guild.members.fetch(targetUser.id).catch(() => null);
      if (!member) {
        return interaction.editReply('❌ Could not find that user in this server.');
      }

      // Remove role from member
      try {
        await member.roles.remove(guildRole.id, `Custom role removed by ${interaction.user.tag}`);
      } catch (err) {
        return interaction.editReply(
          `❌ Could not remove role from user: ${(err as Error).message}`,
        );
      }

      // Delete the role from the server using the fetched Role object
      try {
        await guildRole.delete(`Custom role deleted by ${interaction.user.tag}`);
      } catch (err) {
        return interaction.editReply(
          `⚠️ Role removed from user, but could not delete it from the server: ${(err as Error).message}`,
        );
      }

      const embedRemove = new EmbedBuilder()
        .setTitle('🗑️ Custom Role Removed')
        .setColor(0xed4245)
        .addFields(
          { name: 'User', value: `<@${targetUser.id}>`, inline: true },
          { name: 'Role', value: guildRole.name, inline: true },
        )
        .setFooter({ text: `Removed by ${interaction.user.tag}` })
        .setTimestamp();

      await interaction.editReply({ embeds: [embedRemove] });
      return;
    }

    return;
  },
};
