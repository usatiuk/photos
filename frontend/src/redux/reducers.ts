import { combineReducers } from "redux";
import { persistReducer } from "redux-persist";
import { PersistPartial } from "redux-persist/es/persistReducer";
import storage from "redux-persist/lib/storage";
import { authReducer, IAuthState } from "~redux/auth/reducer";
import {
    ILocalSettingsState,
    localSettingsReducer,
} from "./localSettings/reducer";
import { IUserState, userReducer } from "./user/reducer";

export interface IAppState {
    auth: IAuthState & PersistPartial;
    user: IUserState;
    localSettings: ILocalSettingsState & PersistPartial;
}

const authPersistConfig = {
    key: "auth",
    storage,
    whitelist: ["jwt"],
};

const localSettingsPersistConfig = {
    key: "localSettings",
    storage,
};

export const rootReducer = combineReducers({
    auth: persistReducer<IAuthState>(authPersistConfig, authReducer),
    user: userReducer,
    localSettings: persistReducer(
        localSettingsPersistConfig,
        localSettingsReducer,
    ),
});
