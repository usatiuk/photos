import { Action } from "redux";
import { TUserAuthJSON } from "~src/shared/types";
import {
    showPasswordNotSavedToast,
    showPasswordSavedToast,
} from "~src/AppToaster";

export enum UserTypes {
    USER_GET = "USER_GET",
    USER_GET_SUCCESS = "USER_GET_SUCCESS",
    USER_GET_FAIL = "USER_GET_FAIL",
    USER_LOGOUT = "USER_LOGOUT",
    USER_PASS_CHANGE = "USER_PASS_CHANGE",
    USER_PASS_CHANGE_SUCCESS = "USER_PASS_CHANGE_SUCCESS",
    USER_PASS_CHANGE_FAIL = "USER_PASS_CHANGE_FAIL",
}

export interface TUserGetAction extends Action {
    type: UserTypes.USER_GET;
}

export interface TUserLogoutAction extends Action {
    type: UserTypes.USER_LOGOUT;
}

export interface TUserGetSuccessAction extends Action {
    type: UserTypes.USER_GET_SUCCESS;
    payload: TUserAuthJSON;
}

export interface TUserGetFailAction extends Action {
    type: UserTypes.USER_GET_FAIL;
    payload: {
        error: string;
        logout: boolean;
    };
}

export interface TUserPassChangeAction extends Action {
    type: UserTypes.USER_PASS_CHANGE;
    password: string;
}

export interface TUserPassChangeSuccessAction extends Action {
    type: UserTypes.USER_PASS_CHANGE_SUCCESS;
    payload: TUserAuthJSON;
}

export interface TUserPassChangeFailAction extends Action {
    type: UserTypes.USER_PASS_CHANGE_FAIL;
    payload: {
        error: string;
        logout: boolean;
    };
}

export function getUser(): TUserGetAction {
    return { type: UserTypes.USER_GET };
}

export function logoutUser(): TUserLogoutAction {
    return { type: UserTypes.USER_LOGOUT };
}

export function getUserSuccess(user: TUserAuthJSON): TUserGetSuccessAction {
    return { type: UserTypes.USER_GET_SUCCESS, payload: user };
}

export function getUserFail(
    error: string,
    logout: boolean,
): TUserGetFailAction {
    return { type: UserTypes.USER_GET_FAIL, payload: { error, logout } };
}

export function userPassChange(password: string): TUserPassChangeAction {
    return { type: UserTypes.USER_PASS_CHANGE, password };
}

export function userPassChangeSuccess(
    user: TUserAuthJSON,
): TUserPassChangeSuccessAction {
    showPasswordSavedToast();
    return { type: UserTypes.USER_PASS_CHANGE_SUCCESS, payload: user };
}

export function userPassChangeFail(
    error: string,
    logout: boolean,
): TUserPassChangeFailAction {
    showPasswordNotSavedToast(error);
    return {
        type: UserTypes.USER_PASS_CHANGE_FAIL,
        payload: { error, logout },
    };
}

export type UserAction =
    | TUserGetAction
    | TUserGetSuccessAction
    | TUserGetFailAction
    | TUserLogoutAction
    | TUserPassChangeAction
    | TUserPassChangeFailAction
    | TUserPassChangeSuccessAction;
