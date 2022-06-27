# About

An intuitive, easy to use, and designed by and for the user, single guild, music discord's bot, with dice function, in BETA state.

Right now, it's only available in the spanish language and made to work only one guild at once.
Planned changes in the future:

-   Language as env param.
-   Multiguild bot with connection in bd to save guild's bot configuration.

# Installation and usage

**Node.js 16.6.0 or newer is required.**

-   Install:

    ```
    npm install
    yarn install
    ```

-   Preparation:\n
    Create .env file, copy .env.sample data and fill it up.

-   Activation:
    ```
    npm run start
    yarn start
    ```

## Commands

Let's take as an example that prefix is: ~

**Music commands**
`~p` or `~play`: Plays YouTube video audio. A song name or YouTube URL must follow it.\n
`~pl` or `~playlist`: Send a message with the playlist.\n
`~pause`: Pause current song.\n
`~unpause` or `~resume`: Unpause if the song is paused.\n
`~s` or `~skip`: Skip current song.\n
`~rm` or `~remove`: Shows the playlist, and you can write the index of the song you want to delete from the playlist.\n
`~c` or `~clear`: Delete all songs from the playlist except the one that is playing.\n
`~dp` or `~display`: Send a message with all relevant data from the playlist. This one has access to almost all music commands via emojis.\n
`~loop`: Must be followed by on or off. Anable or disable loop mode.\n
`~shuffle`: Randomize the order of songs on the playlist.\n
`~j` or `~join`: Connect the bot to the user's current voice channel.\n
`~dc` or `~disconnect`: Disconnect the bot from the bot's current voice channel.\n

**Others prefix commands**
`~help` Creates an interactive message with which you can learn in-depth all the commands.\n
`~dice` or `~roll`: Must be followed by on or off. Anable or disable dice command.\n
`~reply`: Must be followed by on or off. Anable or disable reply command.\n

**Non-prefix commands**
These commands need to be activated by one of _Others prefix commands_. Once activated will read all messages and send a message if the content is correct.

-   Dice command: Activated with YDX or DX, or YDX > Z being Y, X and Z numbers. Example: 3D5, D6, 7D10 or 3D6 <= 3.
-   Reply command: Read specific numbers or words and make a joke depending on the message content.
