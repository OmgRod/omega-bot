import { CommandInteraction, EmbedBuilder } from "discord.js";
import { Discord, Slash } from "discordx";
import axios from "axios";

@Discord()
export class HelpCommand {
  @Slash({ description: "List all available commands", name: "help" })
  async help(interaction: CommandInteraction): Promise<void> {
    let commandList = "Failed to fetch commands.";

    try {
      const res = await axios.get("http://localhost:3001/commands");
      const commands = res.data;

      commandList = commands
        .map(
          (cmd: { name: string; description: string; options?: any[] }) =>
            `**/${cmd.name}** - ${cmd.description}` +
            (cmd.options?.length
              ? "\n" +
                cmd.options
                  .map((opt) => ` └ \`${opt.name}\` - ${opt.description}`)
                  .join("\n")
              : "")
        )
        .join("\n\n");
    } catch (error) {
      console.error("Error fetching commands:", error);
    }

    const embed = new EmbedBuilder()
      .setTitle("Omega Bot Help")
      .setDescription(commandList)
      .setColor("Blue")
      .setFooter({ text: "Omega Bot - Your AI Assistant" });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
