import { Action } from "redux";
import { IUserAuthJSON } from "../../../../src/entity/User";

export enum AuthTypes {
    AUTH_START = "AUTH_START",
    SIGNUP_START = "SIGNUP_START",
    AUTH_SUCCESS = "AUTH_SUCCESS",
    AUTH_FAIL = "AUTH_FAIL",
    AUTH_START_FORM_SPINNER = "AUTH_START_FORM_SPINNER",
}

export interface IAuthStartAction extends Action {
    type: AuthTypes.AUTH_START;
    payload: {
        username: string;
        password: string;
    };
}

export interface ISignupStartAction extends Action {
    type: AuthTypes.SIGNUP_START;
    payload: {
        username: string;
        password: string;
        email: string;
    };
}

export interface IAuthSuccessAction extends Action {
    type: AuthTypes.AUTH_SUCCESS;
    payload: IUserAuthJSON;
}

export interface IAuthFailureAction extends Action {
    type: AuthTypes.AUTH_FAIL;
    payload: {
        error: string;
    };
}

export interface IAuthStartFormSpinnerAction extends Action {
    type: AuthTypes.AUTH_START_FORM_SPINNER;
}

export function startFormSpinner(): IAuthStartFormSpinnerAction {
    return { type: AuthTypes.AUTH_START_FORM_SPINNER };
}

export function authStart(
    username: string,
    password: string,
): IAuthStartAction {
    return { type: AuthTypes.AUTH_START, payload: { username, password } };
}

export function signupStart(
    username: string,
    password: string,
    email: string,
): ISignupStartAction {
    return {
        type: AuthTypes.SIGNUP_START,
        payload: { username, password, email },
    };
}

export function authSuccess(user: IUserAuthJSON): IAuthSuccessAction {
    return { type: AuthTypes.AUTH_SUCCESS, payload: user };
}

export function authFail(error: string): IAuthFailureAction {
    return { type: AuthTypes.AUTH_FAIL, payload: { error } };
}

export type AuthAction =
    | IAuthStartAction
    | IAuthSuccessAction
    | IAuthFailureAction
    | IAuthStartFormSpinnerAction
    | ISignupStartAction;
