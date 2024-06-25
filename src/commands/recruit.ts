import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, GuildMember, TextChannel, PermissionFlagsBits } from 'discord.js';
import config from '../config.json';

const { ADMIN_ROLE_ID } = config;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('recruit')
    .setDescription('Creates a private channel for recruitment')
    .addUserOption(option => 
      option.setName('user')
        .setDescription('The user to recruit (admin only)')
        .setRequired(false)),

  async execute(interaction: CommandInteraction) {
    if (!interaction.guild) {
      await interaction.reply('This command can only be used in a server.');
      return;
    }

    const member = interaction.member as GuildMember;
    const mentionedUser = interaction.options.get('user')?.user;
    const isAdmin = member.roles.cache.has(ADMIN_ROLE_ID);

    let userToRecruit: GuildMember;

    if (mentionedUser) {
      if (!isAdmin) {
        await interaction.reply({ content: 'Only admins can recruit other users.', ephemeral: true });
        return;
      }
      userToRecruit = await interaction.guild.members.fetch(mentionedUser.id);
    } else {
      userToRecruit = member;
    }

    try {
      const role = await interaction.guild.roles.create({
        name: `Recruit-${userToRecruit.user.username}`,
        reason: 'Recruitment channel access',
      });

      await userToRecruit.roles.add(role);

      const channel = await interaction.guild.channels.create({
        name: `recruit-${userToRecruit.user.username}`,
        type: 0,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: role.id,
            allow: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: ADMIN_ROLE_ID,
            allow: [PermissionFlagsBits.ViewChannel],
          },
        ],
      }) as TextChannel;

      await interaction.reply({ content: `Recruitment channel created for ${userToRecruit.user.username}!`, ephemeral: true });
      await channel.send(`Welcome ${userToRecruit.user.toString()} to your private recruitment channel!`);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'There was an error creating the recruitment channel.', ephemeral: true });
    }
  },
};
