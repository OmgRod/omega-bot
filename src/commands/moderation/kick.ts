import { ApplicationCommandOptionType, CommandInteraction, GuildMember, PermissionsBitField, User, MessageFlags } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { getEmojiString } from "../../modules/emojis.js";

@Discord()
export class KickCommand {

  @Slash({ description: "Kick a user from the server" })
  async kick(
    @SlashOption({
      description: "User to kick",
      name: "user",
      required: true,
      type: ApplicationCommandOptionType.User,
    })
    user: User,

    interaction: CommandInteraction
  ): Promise<void> {
    // Debug: Log the user object to verify it's being passed correctly
    console.log(user); 

    // Check if the user has permission to kick members
    if (!interaction.member?.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      await interaction.reply({
        content: `${getEmojiString('cross')} You do not have permission to kick members.`,
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

    // Check if the bot has permission to kick the user
    if (!interaction.guild?.members?.me?.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      await interaction.reply({
        content: `${getEmojiString('cross')} I do not have permission to kick members.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Proceed to kick the user
    try {
      await member.kick("Kicked by bot command");

      // Check if user.username is available or fall back to user.username

      await interaction.reply({
        content: `${getEmojiString('check')} <@${user.id}> has been kicked from the server.`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error("Error kicking user:", error);
      await interaction.reply({
        content: `${getEmojiString('cross')} An error occurred while trying to kick the user.`,
        flags: MessageFlags.Ephemeral,
      });
    }
  }
}
