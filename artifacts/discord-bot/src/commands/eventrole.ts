import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { checkPermissions } from '../lib/guards.js';
import { EVENT_WINNER_ROLE_IDS, EVENT_WINNER_ROLE_ID_SET } from '../config.js';

export const eventroleCommand = {
  data: new SlashCommandBuilder()
    .setName('eventrole')
    .setDescription('Manage event winner roles')
    .addSubcommand((sub) =>
      sub
        .setName('add')
        .setDescription('Add an event winner role to a user')
        .addUserOption((opt) =>
          opt.setName('user').setDescription('The user').setRequired(true),
        )
        .addRoleOption((opt) =>
          opt.setName('role').setDescription('The event winner role').setRequired(true),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName('remove')
        .setDescription('Remove an event winner role from a user')
        .addUserOption((opt) =>
          opt.setName('user').setDescription('The user').setRequired(true),
        )
        .addRoleOption((opt) =>
          opt.setName('role').setDescription('The event winner role').setRequired(true),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName('list')
        .setDescription("List all event winner roles, or a specific user's event winner roles")
        .addUserOption((opt) =>
          opt
            .setName('user')
            .setDescription("User to check (omit to list all event winner roles)")
            .setRequired(false),
        ),
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!(await checkPermissions(interaction))) return;

    const sub = interaction.options.getSubcommand();
    const guild = interaction.guild!;

    // ── ADD ──────────────────────────────────────────────────────────────────
    if (sub === 'add' as string) {
      const targetUser = interaction.options.getUser('user', true);
      const roleOption = interaction.options.getRole('role', true);

      if (!EVENT_WINNER_ROLE_ID_SET.has(roleOption.id)) {
        return interaction.reply({
          content: '❌ That role is not in the event winner roles list.',
          ephemeral: true,
        });
      }

      await interaction.deferReply();

      const member = await guild.members.fetch(targetUser.id).catch(() => null);
      if (!member) return interaction.editReply('❌ Could not find that user in this server.');

      await member.roles.add(roleOption.id, `Event winner role added by ${interaction.user.tag}`);

      const embed = new EmbedBuilder()
        .setTitle('🏆 Event Winner Role Added')
        .setColor(0x57f287)
        .addFields(
          { name: 'User', value: `<@${targetUser.id}>`, inline: true },
          { name: 'Role', value: `<@&${roleOption.id}>`, inline: true },
        )
        .setFooter({ text: `Added by ${interaction.user.tag}` })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

    // ── REMOVE ────────────────────────────────────────────────────────────────
    } else if (sub === 'remove') {
      const targetUser = interaction.options.getUser('user', true);
      const roleOption = interaction.options.getRole('role', true);

      if (!EVENT_WINNER_ROLE_ID_SET.has(roleOption.id)) {
        return interaction.reply({
          content: '❌ That role is not in the event winner roles list.',
          ephemeral: true,
        });
      }

      await interaction.deferReply();

      const member = await guild.members.fetch(targetUser.id).catch(() => null);
      if (!member) return interaction.editReply('❌ Could not find that user in this server.');

      await member.roles.remove(
        roleOption.id,
        `Event winner role removed by ${interaction.user.tag}`,
      );

      const embed = new EmbedBuilder()
        .setTitle('🗑️ Event Winner Role Removed')
        .setColor(0xed4245)
        .addFields(
          { name: 'User', value: `<@${targetUser.id}>`, inline: true },
          { name: 'Role', value: `<@&${roleOption.id}>`, inline: true },
        )
        .setFooter({ text: `Removed by ${interaction.user.tag}` })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

    // ── LIST ──────────────────────────────────────────────────────────────────
    } else if (sub === 'list') {
      const targetUser = interaction.options.getUser('user');

      await interaction.deferReply();

      if (targetUser) {
        // Show which event winner roles this user has
        const member = await guild.members.fetch(targetUser.id).catch(() => null);
        if (!member) return interaction.editReply('❌ Could not find that user in this server.');

        const userEventRoles = member.roles.cache.filter((r) =>
          EVENT_WINNER_ROLE_ID_SET.has(r.id),
        );

        const embed = new EmbedBuilder()
          .setTitle(`🏆 Event Winner Roles — ${targetUser.username}`)
          .setColor(0x5865f2)
          .setThumbnail(targetUser.displayAvatarURL())
          .setDescription(
            userEventRoles.size > 0
              ? userEventRoles.map((r) => `<@&${r.id}>`).join('\n')
              : '*This user has no event winner roles.*',
          )
          .setFooter({ text: `${userEventRoles.size} role(s)` })
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
      } else {
        // Show all predefined event winner roles
        const roleLines = EVENT_WINNER_ROLE_IDS.map((id) => {
          const guildRole = guild.roles.cache.get(id);
          return guildRole ? `<@&${id}>` : `Unknown Role (\`${id}\`)`;
        });

        const embed = new EmbedBuilder()
          .setTitle('🏆 Event Winner Roles')
          .setColor(0x5865f2)
          .setDescription(roleLines.join('\n'))
          .setFooter({ text: `${EVENT_WINNER_ROLE_IDS.length} roles total` })
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
      }
    }
    return;
  },
};
