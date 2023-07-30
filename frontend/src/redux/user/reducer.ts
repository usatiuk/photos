import { Reducer } from "react";
import { TUserJSON } from "~/src/shared/types";
import { AuthAction, AuthTypes } from "~src/redux/auth/actions";
import { UserAction, UserTypes } from "./actions";

export interface TUserState {
    user: TUserJSON | null;
}

const defaultUserState: TUserState = {
    user: null,
};

export const userReducer: Reducer<TUserState, AuthAction> = (
    state: TUserState = defaultUserState,
    action: AuthAction | UserAction,
): TUserState => {
    switch (action.type) {
        case AuthTypes.AUTH_SUCCESS:
        case UserTypes.USER_GET_SUCCESS:
        case UserTypes.USER_PASS_CHANGE_SUCCESS:
            return {
                ...defaultUserState,
                user: action.payload,
            };
            break;
        case UserTypes.USER_GET_FAIL:
        case UserTypes.USER_PASS_CHANGE_FAIL:
            return defaultUserState;
            break;
        case UserTypes.USER_LOGOUT:
            return defaultUserState;
            break;
        default:
            return state;
            break;
    }
    return state;
};
