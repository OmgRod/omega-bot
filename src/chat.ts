import { Client, Message, TextChannel, Collection } from "discord.js";
import { getEmojiString } from "./modules/emojis.js";
import ollama from "ollama";

// Store message history per user per channel
const userMessageHistory = new Collection<string, { role: string; content: string }[]>();

export class ChatListener {
    constructor(client: Client) {
        client.on("messageCreate", async (message: Message) => {
            if (message.author.bot || !message.guild || !client.user) return;

            // Check if the bot is mentioned
            if (message.mentions.has(client.user.id, { ignoreEveryone: true })) {
                if (!(message.channel instanceof TextChannel)) return;

                const thinkingMessage = await message.channel.send(`${getEmojiString("hourglass")} Thinking...`);
                console.log("👤 User: " + message.content);

                // Unique key per user per channel
                const userKey = `${message.channel.id}-${message.author.id}`;
                const userHistory = userMessageHistory.get(userKey) || [];

                // Store the new message
                userHistory.push({ role: "user", content: message.content.replace(new RegExp(`<@!?${client.user.id}>`, "g"), "").trim() });

                userMessageHistory.set(userKey, userHistory);

                try {
                    const response = await ollama.chat({
                        model: "llama3.1",
                        messages: userHistory,
                    });

                    let aiResponse = response?.message?.content?.trim() || "I couldn't generate a response. Please try again!";
                    console.log("🤖 AI: " + aiResponse);

                    // Store AI's response
                    userHistory.push({ role: "assistant", content: aiResponse });

                    await thinkingMessage.edit(aiResponse);
                } catch (error) {
                    console.error("❌ Error interacting with Ollama:", error);
                    await thinkingMessage.edit(`${getEmojiString("xmarksolid")} **Error:** Sorry, I couldn't process your message right now.`);
                }
            }
        });
    }
}
