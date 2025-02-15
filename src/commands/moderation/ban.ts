import { ApplicationCommandOptionType, CommandInteraction, GuildMember, MessageFlags, PermissionsBitField, User } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { getEmojiString } from "../../modules/emojis.js";

@Discord()
export class BanCommand {

  @Slash({ description: "Ban a user from the server" })
  async ban(
    @SlashOption({
      description: "User to ban",
      name: "user",
      required: true,
      type: ApplicationCommandOptionType.User,
    })
    user: User,

    interaction: CommandInteraction
  ): Promise<void> {
    // Debug: Log the user object to verify it's being passed correctly
    console.log(user); 

    // Check if the user has permission to ban members
    if (!interaction.member?.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      await interaction.reply({
        content: `${getEmojiString('cross')} You do not have permission to ban members.`,
        flags: MessageFlags.Ephemeral, // Makes the message ephemeral
      });
      return;
    }

    // Get the member object from the user
    const member = interaction.guild?.members.cache.get(user.id) as GuildMember;

    // Check if the user is a valid member
    if (!member) {
      await interaction.reply({
        content: `${getEmojiString('cross')} User not found or is not in the server.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Check if the bot has permission to ban the user
    if (!interaction.guild?.members?.me?.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      await interaction.reply({
        content: `${getEmojiString('cross')} I do not have permission to ban members.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Proceed to ban the user
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
}
