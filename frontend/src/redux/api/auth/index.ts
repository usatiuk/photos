import { IUserAuthJSON } from "~../../src/entity/User";
import { IAPIResponse } from "~../../src/types";
import { fetchJSON } from "../utils";

export async function login(
    username: string,
    password: string,
): Promise<IAPIResponse<IUserAuthJSON>> {
    return (fetchJSON("/users/login", "POST", {
        username,
        password,
    }) as unknown) as Promise<IAPIResponse<IUserAuthJSON>>;
}

export async function signup(
    username: string,
    password: string,
    email: string,
): Promise<IAPIResponse<IUserAuthJSON>> {
    return (fetchJSON("/users/signup", "POST", {
        username,
        password,
        email,
    }) as unknown) as Promise<IAPIResponse<IUserAuthJSON>>;
}
