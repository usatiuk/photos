import { fetchJSONAuth } from "../utils";
import { IUserEditRespBody, IUserGetRespBody } from "../../../../../src/routes/users";

export async function fetchUser(): Promise<IUserGetRespBody> {
    return (fetchJSONAuth("/users/user", "GET") as unknown) as Promise<
        IUserGetRespBody
    >;
}

export async function changeUserPassword(
    newPassword: string,
): Promise<IUserEditRespBody> {
    return fetchJSONAuth("/users/edit", "POST", {
        password: newPassword,
    });
}
