import { CommandInteraction, EmbedBuilder } from "discord.js";
import { Discord, Slash } from "discordx";

@Discord()
export class HelpCommand {
  @Slash({ description: "List all available commands", name: "help" })
  async help(interaction: CommandInteraction): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle("Omega Bot Help")
      .setDescription("Here are the available commands:")
      .setColor("Blue")
      .addFields(
        { name: "/timer create", value: "Set a reminder (e.g., 5m, 2h)", inline: false },
        { name: "/timer remove", value: "Remove a timer by ID", inline: false },
        { name: "/timer rename", value: "Rename a timer", inline: false },
        { name: "/timer list", value: "List all active timers", inline: false },
        { name: "/help", value: "Show this help message", inline: false }
      )
      .setFooter({ text: "Omega Bot - Your AI Assistant" });
    
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}