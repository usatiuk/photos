import { Reducer } from "react";

import { setToken } from "~redux/api/utils";
import { UserAction, UserTypes } from "~redux/user/actions";
import { AuthAction, AuthTypes } from "./actions";

export interface IAuthState {
    jwt: string | null;
    inProgress: boolean;
    formError: string | null;
    formSpinner: boolean;
}

const defaultAuthState: IAuthState = {
    jwt: null,
    inProgress: false,
    formError: null,
    formSpinner: false,
};

export const authReducer: Reducer<IAuthState, AuthAction> = (
    state: IAuthState = defaultAuthState,
    action: AuthAction | UserAction,
): IAuthState => {
    switch (action.type) {
        case AuthTypes.AUTH_START:
        case AuthTypes.SIGNUP_START:
            return { ...defaultAuthState, inProgress: true };
            break;
        case AuthTypes.AUTH_SUCCESS:
        case UserTypes.USER_GET_SUCCESS:
            setToken(action.payload.jwt);
            return {
                ...defaultAuthState,
                jwt: action.payload.jwt,
            };
            break;
        case UserTypes.USER_GET_FAIL:
            if (action.payload.logout) {
                return defaultAuthState;
            }
            break;
        case AuthTypes.AUTH_FAIL:
            return { ...defaultAuthState, formError: action.payload.error };
            break;
        case AuthTypes.AUTH_START_FORM_SPINNER:
            return { ...state, formSpinner: true };
        case UserTypes.USER_LOGOUT:
            return defaultAuthState;
            break;
        default:
            return state;
            break;
    }
    return state;
};
