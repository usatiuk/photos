import { Reducer } from "react";
import { IUserJSON } from "~/src/entity/User";
import { AuthAction, AuthTypes } from "~src/redux/auth/actions";
import { UserAction, UserTypes } from "./actions";

export interface IUserState {
    user: IUserJSON | null;
}

const defaultUserState: IUserState = {
    user: null,
};

export const userReducer: Reducer<IUserState, AuthAction> = (
    state: IUserState = defaultUserState,
    action: AuthAction | UserAction,
): IUserState => {
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
