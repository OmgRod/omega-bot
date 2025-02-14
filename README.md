<div>
  <p align="center">
    <a href="https://discordx.js.org" target="_blank" rel="nofollow">
      <h1>Ω Omega Bot</h1>
    </a>
  </p>

# 📖 Introduction

Omega Bot is a Discord bot that helps manage everyday tasks!

# Getting Started

## Environment Variables

1. Create a copy of `example.env` and rename it to `.env`
2. Go to the [Discord Developer Portal](https://discord.com/developers) and create a bot if you haven't yet
3. Set `BOT_TOKEN` and `CLIENT_ID` to their corresponding values.
4. For the `DB_USER`, `DB_PASSWORD`, `DB_NAME` and, `DB_HOST` values, feel free to select any values (`DB_PORT` must be `5432` but you can change it if you change the ports in [`docker-compose.yml`](https://github.com/OmgRod/omega-bot/blob/main/docker-compose.yml))
5. If you don't want Ollama (chatbot) in your bot, set `OLLAMA_ENABLED` to `0`

## Bot Permissions

1. In the [Discord Developer Portal](https://discord.com/developers), enable all `Privileged Gateway Intents` in the Bot tab.
2. When inviting the bot to servers, ensure the following OAuth2 scopes are enabled:

- `bot`
- `applications.commands`

And the following bot permissions are enabled:

- `Kick Members`
- `Ban Members`
- `Send Messages`
- `Send Messages in Threads`
- `Manage Messages`
- `Embed Links`
- `Attach Files`
- `Read Message History`
- `Use External Emojis`
- `Use External Stickers`
- `Add Reactions`
- `Use Slash Commands`

# 🏗 Development

```
npm install
npm run dev
```

If you want to use [Nodemon](https://nodemon.io/) to auto-reload while in development:

```
npm run watch
```

# 💻 Production

```
npm install --production
npm run build
npm run start
```

# 🐋 Docker

To start your application:

```
docker-compose up -d
```

To shut down your application:

```
docker-compose down
```

To view your application's logs:

```
docker-compose logs
```

For the full command list please view the [Docker Documentation](https://docs.docker.com/engine/reference/commandline/cli/).