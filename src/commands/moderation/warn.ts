import { ApplicationCommandOptionType, MessageFlags, CommandInteraction, User, PermissionsBitField } from "discord.js";
import {  } from "discord.js";
import { Discord, Slash, SlashOption, SlashGroup } from "discordx";
import { v4 as uuidv4 } from "uuid";
import { getEmojiString } from "../../modules/emojis.js";
import { pgClient } from "../../pgClient.js"; // Ensure the pgClient is correctly set up

@Discord()
@SlashGroup({ description: "Manage warnings", name: "warn" }) // Base command: /warn
export class WarnCommand {

  // /warn create
  @Slash({ description: "Warn a user via DM", name: "create" })
  @SlashGroup("warn")  
  async create(
    @SlashOption({
      description: "User to warn",
      name: "user",
      required: true,
      type: ApplicationCommandOptionType.User,
    })
    user: User,

    @SlashOption({
      description: "Warning message",
      name: "message",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    message: string,

    interaction: CommandInteraction
  ): Promise<void> {
    console.log(`Warning user: ${user.username} | Message: ${message}`);

    // Check permission
    if (!interaction.member?.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      await interaction.reply({
        content: `${getEmojiString('cross')} You do not have permission to warn members.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const warnId = uuidv4(); // Generate a unique ID for the warning

    // Store the warning in the database
    try {
      await pgClient.query(
        'INSERT INTO warnings (id, user_id, moderator_id, guild_id, reason, date) VALUES ($1, $2, $3, $4, $5, NOW())',
        [warnId, user.id, interaction.user.id, interaction.guildId, message]
      );

      // Send the warning message via DM
      try {
        await user.send(`${getEmojiString('warning')} **You have been warned in ${interaction.guild?.name}:** ${message}`);
      } catch {
        console.warn(`Could not send DM to ${user.username}`);
      }

      await interaction.reply({
        content: `${getEmojiString('check')} Successfully warned **<@${user.id}>** (ID: ${warnId}).`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error("Error issuing warning:", error);
      await interaction.reply({
        content: `${getEmojiString('cross')} There was an error issuing the warning.`,
        flags: MessageFlags.Ephemeral,
      });
    }
  }

  // /warn list
  @Slash({ description: "List warnings for a user", name: "list" })
  @SlashGroup("warn")  
  async list(
    @SlashOption({
      description: "User to check warnings for",
      name: "user",
      required: true,
      type: ApplicationCommandOptionType.User,
    })
    user: User,

    interaction: CommandInteraction
  ): Promise<void> {
    try {
      const res = await pgClient.query(
        'SELECT id, reason, date FROM warnings WHERE user_id = $1 AND guild_id = $2 ORDER BY date DESC',
        [user.id, interaction.guildId]
      );

      if (res.rows.length === 0) {
        await interaction.reply({
          content: `${getEmojiString('check')} **<@${user.id}>** has no warnings.`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      const warnList = res.rows.map(w => `**ID:** ${w.id}\n${getEmojiString("calendar")} **Date:** ${w.date.toISOString().split("T")[0]}\n${getEmojiString("warning")} **Reason:** ${w.reason}`).join("\n\n");

      await interaction.reply({
        content: `Warnings for **<@${user.id}>**:\n\n${warnList}`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error("Error fetching warnings:", error);
      await interaction.reply({
        content: `${getEmojiString('cross')} Could not retrieve warnings.`,
        flags: MessageFlags.Ephemeral,
      });
    }
  }

  // /warn remove
  @Slash({ description: "Remove a specific warning by ID", name: "remove" })
  @SlashGroup("warn")  
  async remove(
    @SlashOption({
      description: "User whose warning to remove",
      name: "user",
      required: true,
      type: ApplicationCommandOptionType.User,
    })
    user: User,

    @SlashOption({
      description: "Warning ID to remove",
      name: "id",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    warnId: string,

    interaction: CommandInteraction
  ): Promise<void> {
    if (!interaction.member?.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      await interaction.reply({
        content: `${getEmojiString('cross')} You do not have permission to remove warnings.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    try {
      const res = await pgClient.query(
        'DELETE FROM warnings WHERE id = $1 AND user_id = $2 AND guild_id = $3 RETURNING *',
        [warnId, user.id, interaction.guildId]
      );

      if (res.rowCount === 0) {
        await interaction.reply({
          content: `${getEmojiString('cross')} Warning ID **${warnId}** not found for <@${user.id}>.`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      await interaction.reply({
        content: `${getEmojiString('check')} Removed warning **${warnId}** for <@${user.id}>.`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error("Error removing warning:", error);
      await interaction.reply({
        content: `${getEmojiString('cross')} Could not remove warning.`,
        flags: MessageFlags.Ephemeral,
      });
    }
  }
}
