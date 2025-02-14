import { CommandInteraction, TextChannel } from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import { Discord, Slash, SlashOption, SlashGroup } from "discordx";
import { v4 as uuidv4 } from "uuid";
import ms, { StringValue } from "ms";
import { getEmojiString } from "../modules/emojis.js";
import { pgClient } from "../pgClient.js";  // Ensure pgClient is correctly imported

@Discord()
@SlashGroup({ description: "Manage your timers", name: "timer" })  // Main timer group
export class TimerCommand {

  // Create a timer (moved from remind.ts)
  @Slash({ description: "Set a reminder", name: "create" })
  @SlashGroup("timer")  // Ensure it's under the timer group
  async create(
    @SlashOption({
      description: "Time to remind you in (e.g., 5m, 2h)",
      name: "time",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    timeArg: StringValue,

    @SlashOption({
      description: "What should I remind you about?",
      name: "message",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    reminderText: string,

    @SlashOption({
      description: "User to remind",
      name: "user",
      required: false,
      type: ApplicationCommandOptionType.User,
    })
    user: CommandInteraction["user"] | null,

    interaction: CommandInteraction
  ): Promise<void> {
    const userToRemind = user || interaction.user;

    const time = ms(timeArg) as number;
    if (typeof time !== 'number' || isNaN(time)) {
      await interaction.reply({
        content: `${getEmojiString('cross')} Invalid time format. Please use a valid time format like \`5s\`, \`1m\`, \`2h\`, etc.`,
        flags: 64,
      });
      return;
    }

    const id = uuidv4();

    // Store the reminder in PostgreSQL
    try {
      await pgClient.query(
        'INSERT INTO timers (id, user_id, created_by, remind_for, text, time, completed) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [id, interaction.user.id, interaction.user.id, userToRemind.id, reminderText, Date.now() + time, false]
      );

      // Send an ephemeral reply confirming the reminder
      await interaction.reply({
        content: `${getEmojiString('check')} Reminder set for ${userToRemind.tag} (ID: ${id}): I will remind you in ${ms(time, { long: true })} to "${reminderText}"`,
        flags: 64,
      });

      // Set a timeout to send the reminder after the specified time
      setTimeout(async () => {
        if (interaction.channel instanceof TextChannel) {
          await interaction.channel.send(`<@${userToRemind.id}> Reminder (ID: ${id}): ${reminderText}`);
        } else {
          console.error("Channel is not a TextChannel or is unavailable.");
        }

        // Update the reminder status to completed in the database
        await pgClient.query('UPDATE timers SET completed = $1 WHERE id = $2', [true, id]);

        // Remove the completed timer from the database
        await pgClient.query('DELETE FROM timers WHERE id = $1', [id]);
      }, time);

    } catch (error) {
      console.error('Error setting reminder:', error);
      await interaction.reply({
        content: `${getEmojiString('cross')} There was an error setting your reminder. Please try again later.`,
        flags: 64,
      });
    }
  }

  // Remove a timer
  @Slash({ description: 'Remove a timer' })
  @SlashGroup("timer")  // Ensure it's under the timer group
  async remove(
    @SlashOption({ name: "id", description: "The ID of the timer to remove", type: ApplicationCommandOptionType.String, required: true })
    id: string,
    interaction: CommandInteraction
  ): Promise<void> {
    const res = await pgClient.query('SELECT * FROM timers WHERE id = $1 AND (created_by = $2 OR remind_for = $2)', [id, interaction.user.id]);

    if (res.rows.length === 0) {
      await interaction.reply({ content: `${getEmojiString('cross')} You do not have permission to remove this timer or it does not exist.`, flags: 64 });
      return;
    }

    // Remove the timer from the database
    await pgClient.query('DELETE FROM timers WHERE id = $1', [id]);

    await interaction.reply({ content: `${getEmojiString('check')} Timer with ID ${id} has been removed.`, flags: 64 });
  }

  // Rename a timer
  @Slash({ description: 'Rename a timer' })
  @SlashGroup("timer")  // Ensure it's under the timer group
  async rename(
    @SlashOption({ name: "id", description: "The ID of the timer to rename", type: ApplicationCommandOptionType.String, required: true })
    id: string,
    @SlashOption({ name: "new_text", description: "The new text for the timer", type: ApplicationCommandOptionType.String, required: true })
    newText: string,
    interaction: CommandInteraction
  ): Promise<void> {
    const res = await pgClient.query('SELECT * FROM timers WHERE id = $1 AND created_by = $2', [id, interaction.user.id]);

    if (res.rows.length === 0) {
      await interaction.reply({ content: `${getEmojiString('cross')} You do not have permission to rename this timer or it does not exist.`, flags: 64 });
      return;
    }

    // Update the timer's text in the database
    await pgClient.query('UPDATE timers SET text = $1 WHERE id = $2', [newText, id]);

    await interaction.reply({ content: `${getEmojiString('check')} Timer with ID ${id} has been renamed to: "${newText}".`, flags: 64 });
  }

  // List all active timers
  @Slash({ description: 'List all your active timers' })
  @SlashGroup("timer")  // Ensure it's under the timer group
  async list(
    interaction: CommandInteraction
  ): Promise<void> {
    const res = await pgClient.query('SELECT * FROM timers WHERE user_id = $1 AND completed = $2', [interaction.user.id, false]);

    if (res.rows.length === 0) {
      await interaction.reply({ content: 'You have no active timers.', flags: 64 });
      return;
    }

    // Format timers and remaining time with Discord timestamps
    const timerList = res.rows.map(t => {
      const remainingTime = t.time - Date.now();  // Time left for the reminder
      let timeLeftText = 'Expired';
      if (remainingTime > 0) {
        const remainingTimeInDiscordTimestamp = `<t:${Math.floor((Date.now() + remainingTime) / 1000)}:R>`;
        timeLeftText = `Time left: ${remainingTimeInDiscordTimestamp}`;
      }
      return `ID: ${t.id} - Reminder: "${t.text}" - ${timeLeftText}`;
    }).join('\n');

    await interaction.reply({ content: `Your active timers:\n${timerList}`, flags: 64 });
  }
}
