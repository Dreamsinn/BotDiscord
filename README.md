# About

An intuitive, easy to use, and designed by and for the user, multi guild, music discord's bot, with dice function, in BETA state.

Right now, it's only available in the spanish language.
Planned changes in the future:

-   Language as env param.
-   BD connection to save guild's bot configuration.

# Installation and usage

**Node.js 16.6.0 or newer is required.**

- Install:

    ```
    npm install
    ```
    or
    ```
    yarn install
    ```

- Preparation:

    Create .env file, copy .env.sample data and fill it up.

  - TOKEN:
  
    Discord's documentation:
  
    https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot
  
  - API_KEY_YOUTUBE:
    
    API key is required: 
  
    https://console.cloud.google.com/apis/credentials
  
    More data in this page: 
  
    https://developers.google.com/youtube/registering_an_application

  - PREFIX:

    The symbol that the bot will detect to run a command.

  - DEV_ROL:

    Name of the role that will be able to run devOnly commands.
    Optional, if not needed, left it blank.
  
    > Can be put as devOnly by writing true in this option on the commands' schema. 
    > 
    > All schemas are in this route: 
     src/commands/domain/commandSchema
  

- Activation:
    ```
    npm run start
    ```
    or
    ```
    yarn start
    ```

## Commands

Let's take as an example that prefix is: ~

**Music commands**

`~p` or `~play`: Plays YouTube video audio. This command must be followed by the song name or YouTube URL.

`~pl` or `~playlist`: Send a message with the playlist.

`~pause` or `~stop`: Pause current song, if it's paused, resume it.

`~s` or `~skip`: Skip current song.

`~rm` or `~remove`: Shows the playlist, and you can write the index of the song you want to delete.

`~c` or `~clear`: Delete all songs from the playlist.

`~dp` or `~display`: Send a message with all relevant data from the playlist. This one has access to almost all music commands via buttons.

`~loop`: Enable or disable loop mode.

`~shuffle`: Randomize the order of songs on the playlist.

`~j` or `~join`: Connect the bot to the user's current voice channel.

`~dc` or `~disconnect`: Disconnect the bot from the bot's current voice channel.

**Others prefix commands**

`~help` or `~h` Creates an interactive message with which you can learn in-depth all the commands.

`~dice` or `~roll`: Must be followed by on or off. Enable or disable dice command.

`~reply`: Must be followed by on or off. Enable or disable reply command.

**Non-prefix commands**

These commands need to be activated by one of _Others prefix commands_. Once activated will read all messages and send a message if the content is correct.

- Dice command: Activated with YDX or DX, or YDX > Z being, Y, X and Z numbers. Example: 3D5, D6, 7D10 or 3D6 <= 3.
- Reply command: Read specific numbers or words and make a joke depending on the message content.

# Issues
Since July 2022 if the bot is being run with WSL 2, music will stop sounding after 60s.
