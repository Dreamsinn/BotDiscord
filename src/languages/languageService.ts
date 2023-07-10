import { UnionToArray } from './interfaces/unionToArray';

export type Languages = 'es' | 'en';

export const languagesArray: UnionToArray<Languages> = ['es', 'en'];

class LanguageService {
    private jsonDictionary: { [key in Languages]: any };

    constructor() {
        this.jsonDictionary = this.createJsonDictionary();
    }

    private createJsonDictionary(): any {
        // create object with all languages
        const jsonDictionary: { [key in Languages]?: any } = {};

        languagesArray.forEach((lengauge: Languages) => {
            jsonDictionary[lengauge] = import(`./locals/${lengauge}.json`);
        });

        return jsonDictionary;
    }

    public async t(language: Languages, route: string, variables?: { [key: string]: string }) {
        const json = await this.jsonDictionary[language];

        const routeSteps = route.split('.');

        let step = json;
        routeSteps.forEach((key: string) => {
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
