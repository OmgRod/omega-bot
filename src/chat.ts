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

                // Send a "thinking" reply instead of a separate message
                const thinkingMessage = await message.reply({
                    content: `${getEmojiString("hourglass")} Thinking...`,
                    allowedMentions: { users: [message.author.id] }
                });
                // console.log("👤 User: " + message.content);

                // Unique key per user per channel
                const userKey = `${message.channel.id}-${message.author.id}`;
                let userHistory = userMessageHistory.get(userKey) || [];

                // If it's the first message, add a system message
                if (userHistory.length === 0) {
                    userHistory.push({
                        role: "system",
                        content: "You are Omega Bot, a friendly AI assistant for Discord. Always refer to yourself as Omega Bot if your name needs to be mentioned. Be helpful, informative, and engaging, but feel free to change your personality when needed to fit in. You were made by a developer named OmgRod. You were created on the 11th February 2025. You are version 1.0.0. You are powered by Ollama, an AI chatbot API, and your model is Llama 3.1. But don't mention all of this, only do so if the user explicitly asks for it.",
                    });
                }

                // Store the new user message (removing the bot mention)
                userHistory.push({ role: "user", content: message.content.replace(new RegExp(`<@!?${client.user.id}>`, "g"), "").trim() });

                userMessageHistory.set(userKey, userHistory);

                try {
                    const response = await ollama.chat({
                        model: "llama3.1",
                        messages: userHistory,
                    });

                    let aiResponse = response?.message?.content?.trim() || "I couldn't generate a response. Please try again!";
                    // console.log("🤖 Omega Bot: " + aiResponse);

                    // Store AI's response
                    userHistory.push({ role: "assistant", content: aiResponse });

                    // Edit the original reply instead of sending a new message
                    try {
                        await thinkingMessage.edit(aiResponse);
                    } catch (editError: any) {
                        // Handle case where message was deleted while processing
                        if (editError.code === 10008) { // Unknown Message error code
                            console.log("Message was deleted while processing AI response");
                        } else {
                            console.error("Error editing message:", editError);
                        }
                    }
                } catch (error) {
                    console.error("Error interacting with Ollama:", error);
                    try {
                        await thinkingMessage.edit(`${getEmojiString("cross")} **Error:** Sorry, I couldn't process your message right now.`);
                    } catch (editError: any) {
                        // Handle case where message was deleted while processing
                        if (editError.code === 10008) { // Unknown Message error code
                            console.log("Message was deleted while processing AI error response");
                        } else {
                            console.error("Error editing message with error:", editError);
                        }
                    }
                }
            }
        });
    }
}
