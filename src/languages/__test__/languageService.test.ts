import { JsonObject, Languages, LanguageService } from '../languageService'; // Asegúrate de importar correctamente tu clase LanguageService

describe('LanguageService', () => {
    const langauge: Languages = 'en';

    // Definir un objeto de localización mockeado para un idioma específico
    const mockLocalization: JsonObject = {
        key1: {
            example: 'testing text',
        },
        key2: {
            innerKey1: {
                innerKey2: 'text with {{variable}}',
            },
        },
    };

    // Mockear el método createJsonDictionarySync para que devuelva el objeto de localización mockeado
    jest.spyOn(LanguageService.prototype as any, 'createJsonDictionary').mockReturnValue({
        en: mockLocalization, // Cambia el idioma según tus necesidades
    });

    const mokedLs = new LanguageService();

    it('Translate if route Ok', () => {
        const result = mokedLs.t(langauge, 'key1.example');

        expect(result).toEqual('testing text');
    });

    it('Translate if route Ok with variable', () => {
        const result = mokedLs.t(langauge, 'key2.innerKey1.innerKey2', { variable: 'no error' });

        expect(result).toEqual('text with no error');
    });

    it('Translate if route Ok with uneeded variable', () => {
        const result = mokedLs.t(langauge, 'key1.example', { variable: 'no error' });

        expect(result).toEqual('testing text');
    });

    it('Returns the path if it does not exist', () => {
        const path = 'asdfa.af.fd';
        const result = mokedLs.t(langauge, path);

        expect(result).toEqual(path);
    });

    it("Returns the path if language Json doesn't exist", () => {
        const path = 'asdfa.af.fd';
        const result = mokedLs.t('es', path);

        expect(result).toEqual(path);
    });
});
