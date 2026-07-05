import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { checkPermissions } from '../lib/guards.js';
import { STAN_ROLE_IDS, STAN_ROLE_ID_SET } from '../config.js';

export const stanroleCommand = {
  data: new SlashCommandBuilder()
    .setName('stanrole')
    .setDescription('Manage Stan roles')
    .addSubcommand((sub) =>
      sub
        .setName('add')
        .setDescription('Add a Stan role to a user')
        .addUserOption((opt) =>
          opt.setName('user').setDescription('The user').setRequired(true),
        )
        .addRoleOption((opt) =>
          opt.setName('role').setDescription('The Stan role').setRequired(true),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName('remove')
        .setDescription('Remove a Stan role from a user')
        .addUserOption((opt) =>
          opt.setName('user').setDescription('The user').setRequired(true),
        )
        .addRoleOption((opt) =>
          opt.setName('role').setDescription('The Stan role').setRequired(true),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName('list')
        .setDescription("List all Stan roles, or a specific user's Stan roles")
        .addUserOption((opt) =>
          opt
            .setName('user')
            .setDescription("User to check (omit to list all Stan roles)")
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

      if (!STAN_ROLE_ID_SET.has(roleOption.id)) {
        return interaction.reply({
          content: '❌ That role is not in the Stan roles list.',
          ephemeral: true,
        });
      }

      await interaction.deferReply();

      const member = await guild.members.fetch(targetUser.id).catch(() => null);
      if (!member) return interaction.editReply('❌ Could not find that user in this server.');

      await member.roles.add(roleOption.id, `Stan role added by ${interaction.user.tag}`);

      const embedAdd = new EmbedBuilder()
        .setTitle('⭐ Stan Role Added')
        .setColor(0xfee75c)
        .addFields(
          { name: 'User', value: `<@${targetUser.id}>`, inline: true },
          { name: 'Role', value: `<@&${roleOption.id}>`, inline: true },
        )
        .setFooter({ text: `Added by ${interaction.user.tag}` })
        .setTimestamp();

      await interaction.editReply({ embeds: [embedAdd] });

    // ── REMOVE ────────────────────────────────────────────────────────────────
    } else if (sub === 'remove') {
      const targetUser = interaction.options.getUser('user', true);
      const roleOption = interaction.options.getRole('role', true);

      if (!STAN_ROLE_ID_SET.has(roleOption.id)) {
        return interaction.reply({
          content: '❌ That role is not in the Stan roles list.',
          ephemeral: true,
        });
      }

      await interaction.deferReply();

      const member = await guild.members.fetch(targetUser.id).catch(() => null);
      if (!member) return interaction.editReply('❌ Could not find that user in this server.');

      await member.roles.remove(roleOption.id, `Stan role removed by ${interaction.user.tag}`);

      const embedRemove = new EmbedBuilder()
        .setTitle('🗑️ Stan Role Removed')
        .setColor(0xed4245)
        .addFields(
          { name: 'User', value: `<@${targetUser.id}>`, inline: true },
          { name: 'Role', value: `<@&${roleOption.id}>`, inline: true },
        )
        .setFooter({ text: `Removed by ${interaction.user.tag}` })
        .setTimestamp();

      await interaction.editReply({ embeds: [embedRemove] });

    // ── LIST ──────────────────────────────────────────────────────────────────
    } else if (sub === 'list') {
      const targetUser = interaction.options.getUser('user');

      await interaction.deferReply();

      if (targetUser) {
        // Show which Stan roles this user has
        const member = await guild.members.fetch(targetUser.id).catch(() => null);
        if (!member) return interaction.editReply('❌ Could not find that user in this server.');

        const userStanRoles = member.roles.cache.filter((r) => STAN_ROLE_ID_SET.has(r.id));

        const embed = new EmbedBuilder()
          .setTitle(`⭐ Stan Roles — ${targetUser.username}`)
          .setColor(0xfee75c)
          .setThumbnail(targetUser.displayAvatarURL())
          .setDescription(
            userStanRoles.size > 0
              ? userStanRoles.map((r) => `<@&${r.id}>`).join('\n')
              : '*This user has no Stan roles.*',
          )
          .setFooter({ text: `${userStanRoles.size} role(s)` })
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
      } else {
        // Show all predefined Stan roles
        // Discord embed description has a 4096 char limit; split into chunks if needed
        const roleLines = STAN_ROLE_IDS.map((id) => {
          const guildRole = guild.roles.cache.get(id);
          return guildRole ? `<@&${id}>` : `Unknown Role (\`${id}\`)`;
        });

        // Split into chunks of 20 to stay well within embed limits
        const chunkSize = 20;
        const chunks: string[][] = [];
        for (let i = 0; i < roleLines.length; i += chunkSize) {
          chunks.push(roleLines.slice(i, i + chunkSize));
        }

        const embed = new EmbedBuilder()
          .setTitle('⭐ Stan Roles')
          .setColor(0xfee75c)
          .setDescription(chunks[0]!.join('\n'))
          .setFooter({ text: `${STAN_ROLE_IDS.length} roles total` })
          .setTimestamp();

        // If there are more chunks, add them as fields
        for (let i = 1; i < chunks.length; i++) {
          embed.addFields({ name: '\u200b', value: chunks[i]!.join('\n') });
        }

        await interaction.editReply({ embeds: [embed] });
      }
    }
    return;
  },
};
