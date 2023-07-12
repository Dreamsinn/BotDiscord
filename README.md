# Table of contents

1. [About](#about)
2. [Set up](#setup)
   1. [Requirements](#requirements)
   2. [Install dependencies](#dependencies)
   3. [Environment variables](#Environment)
   4. [Add bot into a server](#intoserver)
3. [Start bot](#Start)
4. [Commands](#Commands)
   1. [Music commands](#Music)
   2. [Playlist commands](#Playlist)
   3. [Configuration commands](#Configuration)
   4. [Others commands](#Others)
   5. [Dice comman](#Dice)
5. [Known issues](#issues)

<br>

# About <a id="about"> </a>

A highly configurable, easy to use, and designed by and for the user, multi guild, music discord's bot, with dice function, under development.

This bot has a sqlite database where the following data is backed up:

- Server configuration: prefix, administrator role, language & blacklist.
  <br>

- Commands configuration: Configure commands: coolDown and if the admin role is required to use the command.
  <br>

- Playlist: this bot allows you to save multiple playlists to play whenever you want.

> Bot configuration is recorded by server ID, so different servers may have a different configuration.

> Playlist can be owned by either the server or a user. If it's a user playlist, you can play it on any server that includes that bot.
> <br>

Right now, the creation of lenguage JSON is taking place. It's planed to have only 2 lengauges: Spanish and English. But the incorporation of new JSON is very easy, and this README will explain how in the future.

<br>

# Set up <a id="setup"> </a>

Fist of all this bot's not thought to be in thousands of servers. This was designed to be hosted for personal use and be on any server you are on.

<br>

## Requirements <a id="requirements"> </a>

Node.js 16.6.0 or newer is required.

<br>

## Install dependencies: <a id="dependencies"> </a>

Open a terminal in the folder of the project, a run the next command:

```
npm install
```

or

```
yarn install
```

If **you don't know how** to do it and you're on Windows, here's a hint:

- Open the folder where you downloaded it
- In the folder path, remove everything and write "cmd"
- Woalla! Now that the terminal is open in the correct way, you can enter the command!

<br>

## Environment variables <a id="Environment"> </a>

Create .env file, copy .env.sample data in it and fill it in.

### TOKEN:

Discord's documentation: https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot

1. Got to: https://discord.com/developers/applications and log in with your dicord account

2. Click on the "New Application" button.

3. Enter a name and confirm the pop-up window by clicking the "Create" button.

   The name and image can be changed in the "General Information" tab

4. Go to the "Bot" tab.

5. In "Privileged Gateway Intents" select

   - PRESENCE INTENT
   - MESSAGE CONTENT INTENT

6. At top of the page, click on "Reset token" and copy it.

> **WARNING**: You should not share this token with anyone.

<br>

### API_KEY_YOUTUBE:

1. In this website: https://console.cloud.google.com/

   At top of the page, at the left the Google logo, create a new proyect

2. Once the proyect is created: https://console.cloud.google.com/apis/credentials

3. Select yout proyect and click in "+ create credentials", then select "API key".

4. Copy the "API key" in .env

<br>

This page contains more information about API KEY:

https://developers.google.com/youtube/registering_an_application

<br>

### Spotify credentials

1. Got to Spoty for developers page and log in with a Spotify account: https://developer.spotify.com/

2. Once logged in, go to dashboard: https://developer.spotify.com/dashboard

3. Create an app (in "Redirect URIs" put anything we won't use it)

4. Copy "Client ID" and "Client secret" in .env

<br>

### PREFIX:

The symbol that the bot will identify to execute a command.

<br>

### ADMIN_ROL:

Name of the role that will be able to run adminOnly commands.

Optional, if not required, left empty.

<br>

### LANGUAGES:

If not specified, is English by default.

Options:

- En: English
- Es: Spanish

<br>

## Add bot into a server <a id="intoserver"> </a>

Discord's documentation: https://discordjs.guide/preparations/adding-your-bot-to-servers.html#bot-invite-links

1. Go to the page: https://discord.com/developers/applications and enter into the bot app.

2. Go to the "OAuth2" tab and enter the "URL Generator" tab.

3. In "SCOPES" select:

   - applications.commands
   - bot

4. In "BOT PERMISIONS select:

   - Send Message
   - Create Public Threads
   - Send Messages in Threads
   - Manage Messages
   - Manages Threads
   - Embed Links
   - Add Reactions
   - Connect
   - Speak

5. Under SCOPES, copy the "GENERATED URL"

6. Paste it in your browser, select the server, and finish. You can add the bot to as many servers as you want with this URL.

<br>

# Start bot: <a id="Start"> </a>

Open a terminal in the folder of the project, a run the next command:

```
npm run start
```

or

```
yarn start
```

# Commands <a id="Commands"> </a>

Let's take as an example that prefix is: ~

## Music commands <a id="Music"> </a>

`~p` or `~play`: Plays YouTube video audio. This command must be followed by the song name, YouTube URL, YouTube mobile UPR or Spotify URL.

`~playnow` or `~first`: Select a music in the playlist to play right now.

`~pl` or `~playlist`: Show a paginated list with the playing playlist.

`~pause` or `~stop`: Pause current song, if it's paused, resume it.

`~s` or `~skip`: Skip current song.

`~rm` or `~remove`: Shows the playlist, and you can write the index of the song you want to delete.

`~c` or `~clear`: Delete all songs from the playlist.

`~dp` or `~display`: Create a thread where you will have all playlist data, and you will be able to make almost all music functions via buttons.

`~loop`: Enable or disable loop mode.

`~shuffle`: Randomize the order of songs on the playlist.

`~j` or `~join`: Connect the bot to the user's current voice channel.

`~dc` or `~disconnect`: Disconnect the bot from the bot's current voice channel.

<br>

### Playlist commands <a id="Playlist"> </a>

There are two kinds of playlists, personal and guild.

- Personal playlist: can be played on every server this bot is on. Just by you alone.
- Server playlist: can be played in this guild by anyone with admin role.

By default Playlist commands are personal playlist commands, to interact with server playlists, add "guild" in the request, ex: `~Cpl guild`

<br>

`~cpl` or `~createpl` or `~createplaylist`: This command lets you save a playlist in the database.

`~ppl` or `~playpl` or `~playplaylist`: This command let you play a playlist from database.

`~spl` or `~showpl` or `~showplaylist`: This command lets you play a playlist from the database.

`~upl` or `~updatepl` or `~updateplaylist`: This command lets you update a playlist from the database.

`~dpl` or `~deletepl` or `~deleteplaylist`: This command lets you delete a playlist in the database.

<br>

## Configuration commands <a id="Configuration"> </a>

`~config`: Lets you modify the server configuration, including prefixes, administrator role, language, and blacklist, and save it in the database.

`~command` or `~schema`: Lets you change commands' configuration: cool down or if the admin role is required to use the command, and save in database.

<br>

## Others commands <a id="Others"> </a>

`~help` or `~h` Creates an interactive message with which you can learn in-depth all the commands.

<br>

## Dice command <a id="Dice"> </a>

These consist in 2 commands: one to able or disable the function, and the function of rolling dice.

`~dice` or `~roll`: Must be followed by on or off. Enable or disable dice command.

_Dice command_: Activated with YDX or DX, or YDX > Z being, Y, X and Z numbers. Example: 3D5, D6, 7D10 or 3D6 <= 3.

<br>

# Known issues <a id="issues"> </a>

When the bot is waiting for an answer if you delete the channel where the missatge is, the bot will crash.
