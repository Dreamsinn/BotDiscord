import { Languages } from '../../../../languages/languageService';

export interface NewServer {
  id: string;
  name: string;
  prefix: string;
  adminRole?: string;
  language: Languages;
}
