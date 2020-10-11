import { apiRoot } from "~env";

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

export async function fetchJSON(
    path: string,
    method: string,
    body?: string | Record<string, unknown>,
    headers?: Record<string, string>,
): Promise<Record<string, unknown>> {
    if (typeof body === "object") {
        body = JSON.stringify(body);
    }
    const response = await fetch(apiRoot + path, {
        method,
        body,
        headers: {
            ...headers,
            "Content-Type": "application/json",
        },
    });
    const json = (await response.json()) as Record<string, unknown>;
    return json;
}

export async function fetchJSONAuth(
    path: string,
    method: string,
    body?: string | Record<string, unknown>,
    headers?: Record<string, unknown>,
): Promise<Record<string, unknown>> {
    if (token) {
        return fetchJSON(path, method, body, {
            ...headers,
            Authorization: `Bearer ${token}`,
        });
    } else {
        throw new Error("Not logged in");
    }
}
