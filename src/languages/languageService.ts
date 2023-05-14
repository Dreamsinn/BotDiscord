import { UnionToArray } from './interfaces/unionToArray';

export type Languages = 'es' | 'en';

export const languagesArray: UnionToArray<Languages> = ['es', 'en'];

class LanguageService {
    private languageDictionary: { [key in Languages]: any };

    public async init() {
        // create object with all languages
        const jsonDictionary = await this.createJsonDictionary();

        this.languageDictionary = jsonDictionary;
    }

    private async createJsonDictionary(): Promise<any> {
        const jsonDictionary: { [key in Languages]?: any } = {};

        for (const language of languagesArray) {
            jsonDictionary[language] = JSON.parse(
                JSON.stringify(await import(`./locals/${language}.json`)),
            );
        }

        return jsonDictionary;
    }

    public t(language: Languages, route: string, variables?: { [key: string]: string }) {
        const languageObject = this.languageDictionary[language];

        // route ex: 'schemas.clearPlaylist.name'
        const routeKeys = route.split('.');

        let step = languageObject;
        routeKeys.forEach((key: string) => {
            step = step[key];
        });

        let response = `${step}`;

        if (!variables) {
            return response;
        }

        Object.entries(variables).forEach(([key, value]) => {
            response = response.replace(`{{${key}}}`, value);
        });

        return response;
    }
}

const ls = new LanguageService();
export default ls;
