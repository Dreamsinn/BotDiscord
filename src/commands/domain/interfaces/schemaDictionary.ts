import { CommandsNameEnum } from '../enums/commandNamesEnum';
import { CommandSchema } from './commandSchema';

export type SchemaDictionary = {
  readonly [key in CommandsNameEnum]: CommandSchema;
};
