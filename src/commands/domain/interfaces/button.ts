import { ButtonsStyleEnum } from '../enums/buttonStyleEnum';

export type ButtonRowList = [ButtonRow?, ButtonRow?, ButtonRow?, ButtonRow?, ButtonRow?];

export type ButtonRow = [Button?, Button?, Button?, Button?, Button?];

export interface Button {
    style: ButtonsStyleEnum;
    label: string;
    custom_id: string;
    url?: string;
    disabled?: boolean;
}
