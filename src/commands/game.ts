import { Discord, Slash, SlashGroup, SlashOption, ButtonComponent, ModalComponent } from "discordx";
import { CommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, Interaction, MessageComponentInteraction, ModalSubmitInteraction, MessageFlags, ApplicationCommandType, ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import fs from "fs";
import csv from "csv-parser"; // Import csv-parser for parsing the CSV file
import { getEmojiString } from "../modules/emojis.js"; // Assuming this exists in both files
import { pgClient } from "../pgClient.js"; // Ensure this is imported correctly

// Load words from CSV file
const words: string[] = [];

fs.createReadStream("res/wordle.csv")
  .pipe(csv())
  .on("data", (row) => {
    if (row.words) {
      words.push(row.words.toLowerCase()); // Add word to the array, ensuring it's in lowercase
    }
  })
  .on("end", () => {
    console.log(`Loaded ${words.length} words from wordle.csv`);
  });

@Discord()
@SlashGroup({ name: "game", description: "Game-related commands" })
@SlashGroup("game")
export class WordleCommand {
    private activeGames = new Map<string, { word: string; attempts: string[]; maxGuesses: number }>();

    // Reusable permission check
    private async checkPermissions(interaction: CommandInteraction): Promise<boolean> {
        if (!interaction.member?.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            await interaction.reply({
                content: `${getEmojiString('cross')} You do not have permission to perform this action.`,
                flags: MessageFlags.Ephemeral,
            });
            return false;
        }
        return true;
    }

    // Reusable database function for querying
    private async queryDatabase(query: string, params: any[]): Promise<any> {
        try {
            const result = await pgClient.query(query, params);
            return result;
        } catch (error) {
            console.error("Database Error:", error);
            return null;
        }
    }

    @Slash({ name: "wordle", description: "Start a Wordle game" })
    async wordle(
        @SlashOption({ name: "guesses", description: "Max guesses (default: 6)", type: ApplicationCommandOptionType.Number, required: false }) maxGuesses: number | undefined,
        interaction: CommandInteraction
    ) {
        await interaction.deferReply({ /*ephemeral: true*/ });

        const word = words[Math.floor(Math.random() * words.length)].toLowerCase();
        const userId = interaction.user.id;

        this.activeGames.set(userId, { word, attempts: [], maxGuesses: maxGuesses ?? 6 });

        const embed = new EmbedBuilder()
            .setTitle("🔠 Wordle Game")
            .setDescription("Press the button below to guess a word.")
            .setColor("#2F3136");

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId(`wordle_guess_${userId}`).setLabel("Make a Guess").setStyle(ButtonStyle.Primary)
        );

        await interaction.followUp({ embeds: [embed], components: [row], /*ephemeral: true*/ });
    }

    @ButtonComponent({ id: /^wordle_guess_\d+$/ })
    async guessButton(interaction: MessageComponentInteraction) {
        if (!this.activeGames.has(interaction.user.id)) {
            return interaction.reply({ content: "❌ No active Wordle game found. Start one with `/game wordle`.", flags: MessageFlags.Ephemeral});
        }

        const modal = new ModalBuilder()
            .setCustomId(`wordle_modal_${interaction.user.id}`)
            .setTitle("Enter Your Wordle Guess")
            .addComponents(
                new ActionRowBuilder<TextInputBuilder>().addComponents(
                    new TextInputBuilder().setCustomId("word_input").setLabel("Enter a 5-letter word").setStyle(TextInputStyle.Short).setMinLength(5).setMaxLength(5)
                )
            );

        await interaction.showModal(modal);
    }

    @ModalComponent({ id: /^wordle_modal_\d+$/ })
    async handleGuess(interaction: ModalSubmitInteraction) {
        const userId = interaction.user.id;
        const game = this.activeGames.get(userId);

        if (!game) {
            return interaction.reply({ content: "❌ No active game found.", ephemeral: true });
        }

        const guess = interaction.fields.getTextInputValue("word_input").toLowerCase();

        if (!words.includes(guess)) {
            return interaction.reply({ content: "❌ Invalid word! Not found in dictionary.", ephemeral: true });
        }

        game.attempts.push(guess);
        this.activeGames.set(userId, game);

        let display = game.attempts.map((attempt) => this.getWordleFeedback(attempt, game.word)).join("\n");

        if (guess === game.word) {
            display += "\n\n🎉 **You won!**";
            this.activeGames.delete(userId);
        } else if (game.attempts.length >= game.maxGuesses) {
            display += `\n\n❌ **Game over! The word was:** \`${game.word}\``;
            this.activeGames.delete(userId);
        }

        const embed = new EmbedBuilder().setTitle("🔠 Wordle Game").setDescription(display).setColor("#2F3136");

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId(`wordle_guess_${userId}`).setLabel("Make a Guess").setStyle(ButtonStyle.Primary).setDisabled(game.attempts.length >= game.maxGuesses)
        );

        await interaction.update({ embeds: [embed], components: [row] });
    }

    private getWordleFeedback(guess: string, word: string): string {
        let result = "";
        const wordArray = word.split("");
        const guessArray = guess.split("");

        // Go through each letter in the guess and compare it to the word
        for (let i = 0; i < 5; i++) {
            if (guessArray[i] === wordArray[i]) {
                result += "🟩"; // Correct position
                wordArray[i] = "_"; // Mark as used
            } else if (wordArray.includes(guessArray[i])) {
                result += "🟨"; // Wrong position
                wordArray[wordArray.indexOf(guessArray[i])] = "_"; // Mark as used
            } else {
                result += "⬜"; // Not in word
            }
        }

        return `${guess.toUpperCase()} → ${result}`;
    }
}
