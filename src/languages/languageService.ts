import { UnionToArray } from './interfaces/unionToArray';

export type Languages = 'es' | 'en';

export const languagesArray: UnionToArray<Languages> = ['es', 'en'];

export type JsonObject = {
    [key: string]: JsonObject | string;
};

export class LanguageService {
    private jsonDictionary: { [key in Languages]: JsonObject };

    constructor() {
        this.jsonDictionary = this.createJsonDictionary();
    }

    private createJsonDictionary(): any {
        // create object with all languages
        const jsonDictionary: { [key in Languages]?: JsonObject } = {};

        languagesArray.forEach((lengauge: Languages) => {
            jsonDictionary[lengauge] = require(`./locals/${lengauge}.json`);
        });

        return jsonDictionary;
    }

    public t(language: Languages, route: string, variables?: { [key: string]: string }) {
        const json = this.jsonDictionary[language];

        if (!json) {
            return route;
        }

        const routeSteps = route.split('.');

        let response = this.getValueFromPath(routeSteps, json);

        // if wront route, return it
        if (!response) {
            return route;
        }

        if (!variables) {
            return response;
        }

        Object.entries(variables).forEach(([key, value]) => {
            response = response!.replace(`{{${key}}}`, value);
        });

        return response;
    }

    private getValueFromPath(path: string[], obj: any): string | undefined {
        let step = obj;
        for (const key of path) {
            if (step.hasOwnProperty(key)) {
                step = step[key];
            } else {
                return undefined;
            }
        }

        return step;
    }
}

const ls = new LanguageService();
export default ls;
