import { 
  ApplicationCommandOptionType, 
  CommandInteraction, 
  GuildMember, 
  MessageFlags, 
  PermissionsBitField, 
  User 
} from "discord.js";
import { Discord, Slash, SlashOption, SlashGroup } from "discordx";
import { getEmojiString } from "../../modules/emojis.js";

@Discord()
@SlashGroup({ description: "Manage bans", name: "ban" })
export class BanCommand {

  @Slash({ description: "Ban a user from the server", name: "create" })
  @SlashGroup("ban")
  async banCreate(
    @SlashOption({
      description: "User to ban",
      name: "user",
      required: true,
      type: ApplicationCommandOptionType.User,
    })
    user: User,
    interaction: CommandInteraction
  ): Promise<void> {
    console.log(user);

    if (!interaction.member?.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      await interaction.reply({
        content: `${getEmojiString('cross')} You do not have permission to ban members.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const member = interaction.guild?.members.cache.get(user.id) as GuildMember;
    if (!member) {
      await interaction.reply({
        content: `${getEmojiString('cross')} User not found or is not in the server.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (!interaction.guild?.members?.me?.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      await interaction.reply({
        content: `${getEmojiString('cross')} I do not have permission to ban members.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    try {
      await member.ban({ reason: "Banned by bot command" });
      await interaction.reply({
        content: `${getEmojiString('check')} <@${user.id}> has been banned from the server.`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error("Error banning user:", error);
      await interaction.reply({
        content: `${getEmojiString('cross')} An error occurred while trying to ban the user.`,
        flags: MessageFlags.Ephemeral,
      });
    }
  }

  @Slash({ description: "Unban a user from the server", name: "remove" })
  @SlashGroup("ban")
  async banRemove(
    @SlashOption({
      description: "User ID to unban",
      name: "user_id",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    userId: string,
    interaction: CommandInteraction
  ): Promise<void> {
    console.log(userId);

    if (!interaction.member?.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      await interaction.reply({
        content: `${getEmojiString('cross')} You do not have permission to unban members.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (!interaction.guild?.members?.me?.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      await interaction.reply({
        content: `${getEmojiString('cross')} I do not have permission to unban members.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    try {
      await interaction.guild?.bans.remove(userId);
      await interaction.reply({
        content: `${getEmojiString('check')} <@${userId}> has been unbanned from the server.`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error("Error unbanning user:", error);
      await interaction.reply({
        content: `${getEmojiString('cross')} An error occurred while trying to unban the user.`,
        flags: MessageFlags.Ephemeral,
      });
    }
  }

  @Slash({ description: "List all banned users", name: "list" })
  @SlashGroup("ban")
  async banList(interaction: CommandInteraction): Promise<void> {
    if (!interaction.member?.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      await interaction.reply({
        content: `${getEmojiString('cross')} You do not have permission to view the ban list.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    try {
      const bans = await interaction.guild?.bans.fetch();
      if (!bans || bans.size === 0) {
        await interaction.reply({
          content: "There are no banned users.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      const banList = bans.map(ban => `<@${ban.user.id}> (ID: ${ban.user.id})`).join('\n');
      await interaction.reply({
        content: `**Banned Users:**\n${banList}`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error("Error fetching ban list:", error);
      await interaction.reply({
        content: `${getEmojiString('cross')} An error occurred while retrieving the ban list.`,
        flags: MessageFlags.Ephemeral,
      });
    }
  }
}
