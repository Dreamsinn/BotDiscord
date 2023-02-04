import { ClearPlayListCommandSchema } from './clearPlayListCommandSchema';
import { DiceCommandSchema } from './diceCommandSchema';
import { DiceCommandTogglerSchema } from './diceCommandTogglerSchema';
import { DisconnectCommandSchema } from './disconnectCommandSchema';
import { DisplayPlayListCommandSchema } from './displayPlayListCommandSchema';
import { HelpCommandSchema } from './helpCommandSchema';
import { JoinChannelCommandSchema } from './joinChannelCommandSchema';
import { LoopPlayListModeCommandSchema } from './loopPlayListModeCommandSchema';
import { PauseCommandSchema } from './pauseCommandSchema';
import { PlayCommandSchema } from './playCommandSchema';
import { PlayListCommandSchema } from './playListCommandSchema';
import { PlayNowCommandSchema } from './playNowCommandSchema';
import { RemoveSongsFromPlayListCommandSchema } from './removeSongsFromPlayListCommandSchema';
import { ReplyCommandSchema } from './replyCommandSchema';
import { ReplyCommandTogglerSchema } from './replyCommandTogglerSchema';
import { ShufflePlayListCommandSchema } from './shufflePlayListCommandSchema';
import { SkipMusicCommandSchema } from './skipMusicCommandSchema';

export const commandsSchemasList = [
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
];