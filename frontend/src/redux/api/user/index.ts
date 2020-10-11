import { fetchJSON, fetchJSONAuth } from "../utils";
import { IAPIResponse } from "~/../../src/types";
import { IUserAuthJSON, IUserJSON } from "~../../src/entity/User";

export async function fetchUser(): Promise<IAPIResponse<IUserJSON>> {
    return (fetchJSONAuth("/users/user", "GET") as unknown) as Promise<
        IAPIResponse<IUserAuthJSON>
    >;
}

export async function changeUserPassword(newPassword: string) {
    return (fetchJSONAuth("/users/edit", "POST", {
        password: newPassword,
    }) as unknown) as Promise<IAPIResponse<IUserAuthJSON>>;
}
