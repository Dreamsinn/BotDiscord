import { CommandSchema } from '../interfaces/commandSchema';
import { ClearPlayListCommandSchema } from './clearPlayListCommandSchema';
import { ConfigSchemaCommandSchema } from './configSchemaCommandSchema';
import { ConfigServerCommandSchema } from './configServerCommandSchema';
import { CreatePlaylistCommandSchema } from './createPlaylisyCommandSchema';
import { DeletePlaylistCommandSchema } from './deletePlaylistCommandSchema';
import { DiceCommandSchema } from './diceCommandSchema';
import { DiceCommandTogglerSchema } from './diceCommandTogglerSchema';
import { DisconnectCommandSchema } from './disconnectCommandSchema';
import { DisplayPlayListCommandSchema } from './displayPlayListCommandSchema';
import { HelpCommandSchema } from './helpCommandSchema';
import { JoinChannelCommandSchema } from './joinChannelCommandSchema';
import { LogPlaylistStatusSchema } from './logPlaylistStatusSchema';
import { LoopPlayListModeCommandSchema } from './loopPlayListModeCommandSchema';
import { PauseCommandSchema } from './pauseCommandSchema';
import { PlayCommandSchema } from './playCommandSchema';
import { PlayListCommandSchema } from './playListCommandSchema';
import { PlayNowCommandSchema } from './playNowCommandSchema';
import { RemoveSongsFromPlayListCommandSchema } from './removeSongsFromPlayListCommandSchema';
import { ReplyCommandSchema } from './replyCommandSchema';
import { ReplyCommandTogglerSchema } from './replyCommandTogglerSchema';
import { ShowPlaylistCommandSchema } from './showPlaylistCommand';
import { ShufflePlayListCommandSchema } from './shufflePlayListCommandSchema';
import { SkipMusicCommandSchema } from './skipMusicCommandSchema';
import { UpdatePlaylistCommandSchema } from './updatePlaylistCommandSchema';

export const commandsSchemasList: CommandSchema[] = [
    DiceCommandSchema,
    ReplyCommandSchema,
    HelpCommandSchema,
    DiceCommandTogglerSchema,
    ReplyCommandTogglerSchema,
    PlayCommandSchema,
    PlayListCommandSchema,
    PauseCommandSchema,
    SkipMusicCommandSchema,
    PlayNowCommandSchema,
    RemoveSongsFromPlayListCommandSchema,
    ClearPlayListCommandSchema,
    DisplayPlayListCommandSchema,
    LoopPlayListModeCommandSchema,
    ShufflePlayListCommandSchema,
    JoinChannelCommandSchema,
    DisconnectCommandSchema,
    LogPlaylistStatusSchema,
    ConfigServerCommandSchema,
    ConfigSchemaCommandSchema,
    CreatePlaylistCommandSchema,
    ShowPlaylistCommandSchema,
    DeletePlaylistCommandSchema,
    UpdatePlaylistCommandSchema,
];
