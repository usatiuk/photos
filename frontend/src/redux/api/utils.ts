import { apiRoot } from "~src/env";
import { IAPIResponse } from "~/src/shared/types";

let token: string | null;

export function setToken(_token: string): void {
    token = _token;
}

export function getToken(): string | null {
    return token;
}

export function deleteToken(): void {
    token = null;
}

export async function fetchJSON<T>(
    path: string,
    method: string,
    body?: string | Record<string, unknown> | File,
    headers?: Record<string, string>,
): Promise<IAPIResponse<T>> {
    if (typeof body === "object" && !(body instanceof File)) {
        body = JSON.stringify(body);
        headers = {
            ...headers,
            "Content-Type": "application/json",
        };
    }
    // TODO: io-ts or something like that
    if (body instanceof File) {
        const formData = new FormData();
        formData.append("photo", body);
        const response = await fetch(apiRoot + path, {
            method,
            headers,
            body: formData,
        });
        const json = (await response.json()) as Record<string, unknown>;
        return json as unknown as IAPIResponse<T>;
    }

    const response = await fetch(apiRoot + path, {
        method,
        body,
        headers,
    });
    const json = (await response.json()) as Record<string, unknown>;
    return json as unknown as IAPIResponse<T>;
}

export async function fetchJSONAuth<T>(
    path: string,
    method: string,
    body?: string | Record<string, unknown> | File,
    headers?: Record<string, unknown>,
): Promise<IAPIResponse<T>> {
    if (token) {
        return fetchJSON(path, method, body, {
            ...headers,
            Authorization: `Bearer ${token}`,
        });
    } else {
        throw new Error("Not logged in");
    }
}
