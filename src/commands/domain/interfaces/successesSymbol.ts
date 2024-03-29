export interface SuccessesSymbol {
    readonly symbol: rollSymbol;
    readonly symbolPosition: number;
    readonly symbolLength: number;
    readonly plusSymbol: boolean;
}

export type rollSymbol = '>=' | '>' | '<=' | '<';
