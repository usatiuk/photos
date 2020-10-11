import { Action } from "redux";

export enum LocalSettingsTypes {
    TOGGLE_DARK_MODE = "TOGGLE_DARK_MODE",
}

export interface IToggleDarkModeAction extends Action {
    type: LocalSettingsTypes.TOGGLE_DARK_MODE;
}

export function toggleDarkMode(): IToggleDarkModeAction {
    return { type: LocalSettingsTypes.TOGGLE_DARK_MODE };
}

export type LocalSettingsAction = IToggleDarkModeAction;
