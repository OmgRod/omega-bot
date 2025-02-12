import { CommandInteraction, EmbedBuilder } from "discord.js";
import { Discord, Slash } from "discordx";

@Discord()
export class HelpCommand {
  @Slash({ description: "Terms of Service and Privacy Policy", name: "legal" })
  async help(interaction: CommandInteraction): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle("Omega Bot Legal")
      .setColor("Blue")
      .addFields(
        { 
          name: "Terms of Service", 
          value: "[Click here to view](https://github.com/OmgRod/omega-bot/blob/main/Terms.md)", 
          inline: false 
        },
        { 
          name: "Privacy Policy", 
          value: "[Click here to view](https://github.com/OmgRod/omega-bot/blob/main/PrivacyPolicy.md)", 
          inline: false 
        }
      )
      .setFooter({ text: "Omega Bot - Your AI Assistant" });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
