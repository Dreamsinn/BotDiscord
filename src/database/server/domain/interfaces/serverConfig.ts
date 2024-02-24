import { Languages } from '../../../../languages/languageService';

export interface ServerConfig {
  prefix?: string;
  adminRole?: string;
  blackList?: string[];
  language?: Languages;
}
