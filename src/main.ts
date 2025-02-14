import { dirname, importx } from "@discordx/importer";
import type { Interaction, Message } from "discord.js";
import { ActivityType, IntentsBitField } from "discord.js";
import { Client } from "discordx";
import { ChatListener } from "./chat.js";
import express, { Request, Response } from "express"; // Import Express types
import cors from "cors"; // Import CORS
import * as dotenv from "dotenv";

dotenv.config();

export const bot = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.GuildVoiceStates,
    IntentsBitField.Flags.MessageContent,
  ],
  silent: false,
  simpleCommand: { prefix: "!" },
});

// Express server setup
const app = express();
app.use(cors()); // Allow frontend access
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Discord bot API is running!");
});

app.get("/bot-status", (req: Request, res: Response) => {
  res.json({ online: bot.isReady(), username: bot.user?.username });
});

app.get("/commands", (req: Request, res: Response) => {
  res.json(
    bot.application?.commands.cache.map((cmd) => ({
      name: cmd.name,
      description: cmd.description,
    }))
  );
});

// Start Express server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));

bot.once("ready", () => {
  void bot.initApplicationCommands();
  console.log("Bot started");

  if (process.env.OLLAMA_ENABLED == "1") {
    new ChatListener(bot);
  }

  bot.user?.setPresence({
    activities: [{ name: "/help", type: ActivityType.Watching }],
    status: "idle",
  });
});

bot.on("interactionCreate", (interaction: Interaction) => {
  bot.executeInteraction(interaction);
});

bot.on("messageCreate", (message: Message) => {
  void bot.executeCommand(message);
});

async function run() {
  await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`);

  if (!process.env.BOT_TOKEN) {
    throw Error("Could not find BOT_TOKEN in your environment");
  }

  await bot.login(process.env.BOT_TOKEN);
}

void run();
