import { IUserLoginRespBody, IUserSignupRespBody } from "~/src/shared/types";
import { fetchJSON } from "../utils";

export async function login(
    username: string,
    password: string,
): Promise<IUserLoginRespBody> {
    return fetchJSON("/users/login", "POST", {
        username,
        password,
    });
}

export async function signup(
    username: string,
    password: string,
    email: string,
): Promise<IUserSignupRespBody> {
    return fetchJSON("/users/signup", "POST", {
        username,
        password,
        email,
    });
}
