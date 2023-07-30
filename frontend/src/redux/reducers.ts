import { combineReducers } from "redux";
import { persistReducer } from "redux-persist";
import { PersistPartial } from "redux-persist/es/persistReducer";
import storage from "redux-persist/lib/storage";
import { authReducer, IAuthState } from "../redux/auth/reducer";
import {
    ILocalSettingsState,
    localSettingsReducer,
} from "./localSettings/reducer";
import { TPhotosState, photosReducer } from "./photos/reducer";
import { TUserState, userReducer } from "./user/reducer";

export interface IAppState {
    auth: IAuthState & PersistPartial;
    user: TUserState;
    localSettings: ILocalSettingsState & PersistPartial;
    photos: TPhotosState;
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
    auth: persistReducer<IAuthState>(authPersistConfig, authReducer as any),
    user: userReducer,
    localSettings: persistReducer(
        localSettingsPersistConfig,
        localSettingsReducer as any,
    ),
    photos: photosReducer,
});
