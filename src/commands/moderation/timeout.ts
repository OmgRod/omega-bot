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
  import ms, { StringValue } from "ms";
  
  @Discord()
  @SlashGroup({ description: "Manage timeouts", name: "timeout" })
  export class TimeoutCommand {
  
    @Slash({ description: "Timeout a user in the server", name: "apply" })
    @SlashGroup("timeout")
    async timeoutApply(
      @SlashOption({
        description: "User to timeout",
        name: "user",
        required: true,
        type: ApplicationCommandOptionType.User,
      })
      user: User,
  
      @SlashOption({
        description: "Duration of the timeout (e.g., 5m, 1h, 2d)",
        name: "duration",
        required: true,
        type: ApplicationCommandOptionType.String,
      })
      duration: StringValue,
  
      interaction: CommandInteraction
    ): Promise<void> {
      console.log(user);
  
      if (!interaction.member?.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
        await interaction.reply({
          content: `${getEmojiString('cross')} You do not have permission to timeout members.`,
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
  
      if (!interaction.guild?.members?.me?.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
        await interaction.reply({
          content: `${getEmojiString('cross')} I do not have permission to timeout members.`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
  
      const timeoutDuration = ms(duration);
      if (!timeoutDuration || isNaN(timeoutDuration)) {
        await interaction.reply({
          content: `${getEmojiString('cross')} Invalid duration format. Please use a valid time format like \`5m\`, \`1h\`, \`2d\`, etc.`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
  
      try {
        await member.timeout(timeoutDuration, `Timed out by bot command for ${ms(timeoutDuration, { long: true })}`);
        await interaction.reply({
          content: `${getEmojiString('check')} <@${user.id}> has been timed out for ${ms(timeoutDuration, { long: true })}.`,
          flags: MessageFlags.Ephemeral,
        });
      } catch (error) {
        console.error("Error timing out user:", error);
        await interaction.reply({
          content: `${getEmojiString('cross')} An error occurred while trying to timeout the user.`,
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  
    @Slash({ description: "Remove a timeout from a user", name: "remove" })
    @SlashGroup("timeout")
    async timeoutRemove(
      @SlashOption({
        description: "User to remove timeout from",
        name: "user",
        required: true,
        type: ApplicationCommandOptionType.User,
      })
      user: User,
      interaction: CommandInteraction
    ): Promise<void> {
      console.log(user);
  
      if (!interaction.member?.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
        await interaction.reply({
          content: `${getEmojiString('cross')} You do not have permission to remove timeouts.`,
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
  
      if (!interaction.guild?.members?.me?.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
        await interaction.reply({
          content: `${getEmojiString('cross')} I do not have permission to remove timeouts.`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
  
      try {
        await member.timeout(null);
        await interaction.reply({
          content: `${getEmojiString('check')} <@${user.id}>'s timeout has been removed.`,
          flags: MessageFlags.Ephemeral,
        });
      } catch (error) {
        console.error("Error removing timeout:", error);
        await interaction.reply({
          content: `${getEmojiString('cross')} An error occurred while trying to remove the timeout.`,
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  }
  