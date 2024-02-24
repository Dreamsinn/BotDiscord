import { Languages } from '../../../../languages/languageService';

export interface UpdateServer {
  updatedBy: string;
  updatedAt: Date;
  prefix?: string;
  adminRole?: string;
  blackList?: string;
  playList?: string;
  language?: Languages;
}
