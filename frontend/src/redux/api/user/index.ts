import { fetchJSONAuth } from "../utils";
import {
    TUserEditRespBody,
    TUserGetRespBody,
    UserEditRespBody,
    UserGetRespBody,
} from "~/src/shared/types";

export async function fetchUser(): Promise<TUserGetRespBody> {
    return fetchJSONAuth("/users/user", "GET", UserGetRespBody);
}

export async function changeUserPassword(
    newPassword: string,
): Promise<TUserEditRespBody> {
    return fetchJSONAuth("/users/edit", "POST", UserEditRespBody, {
        password: newPassword,
    });
}
