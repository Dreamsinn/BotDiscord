import { RawSongData } from './songData';
import {SoundCloudStream, YouTubeStream, YouTubeVideo } from 'play-dl';

export interface APIResponse <dataType>{
    isError: boolean,
    data: dataType,
    errorData?: TypeError
}