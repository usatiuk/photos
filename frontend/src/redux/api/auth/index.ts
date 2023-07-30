import {
    TUserLoginRespBody,
    TUserSignupRespBody,
    UserLoginRespBody,
    UserSignupRespBody,
} from "~/src/shared/types";
import { fetchJSON } from "../utils";

export async function login(
    username: string,
    password: string,
): Promise<TUserLoginRespBody> {
    return fetchJSON("/users/login", "POST", UserLoginRespBody, {
        username,
        password,
    });
}

export async function signup(
    username: string,
    password: string,
    email: string,
): Promise<TUserSignupRespBody> {
    return fetchJSON("/users/signup", "POST", UserSignupRespBody, {
        username,
        password,
        email,
    });
}
