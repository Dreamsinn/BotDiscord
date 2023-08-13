import { Languages } from '../languageService';
import { typeIsLanguage } from '../utils/typeIsLanguage';

describe('LanguageService', () => {
    it('Return true if language exist', () => {
        const es: Languages = 'es';
        const boolean = typeIsLanguage(es);

        expect(boolean).toBe(true);
    });

    it("Return false if language doen't exist", () => {
        const boolean = typeIsLanguage('eds');

        expect(boolean).toBe(false);
    });
});
