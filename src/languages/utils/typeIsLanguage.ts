import { Languages, languagesArray } from '../languageService';

export function typeIsLanguage(value: string): value is Languages {
    return languagesArray.some((language: Languages) => language === value);
}
