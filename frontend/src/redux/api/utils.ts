import { apiRoot } from "~src/env";

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

export async function fetchJSON<T, P extends { parse: (string) => T }>(
    path: string,
    method: string,
    parser: P,
    body?: string | Record<string, unknown> | File,
    headers?: Record<string, string>,
): Promise<T> {
    const reqBody = () =>
        body instanceof File
            ? (() => {
                  const fd = new FormData();
                  fd.append("photo", body);
                  return fd;
              })()
            : JSON.stringify(body);

    const reqHeaders = () =>
        body instanceof File
            ? headers
            : { ...headers, "Content-Type": "application/json" };

    const response = await fetch(apiRoot + path, {
        method,
        headers: reqHeaders(),
        body: reqBody(),
    });
    return parser.parse(await response.json());
}

export async function fetchJSONAuth<T, P extends { parse: (string) => T }>(
    path: string,
    method: string,
    parser: P,
    body?: string | Record<string, unknown> | File,
    headers?: Record<string, unknown>,
): Promise<T> {
    if (token) {
        return fetchJSON(path, method, parser, body, {
            ...headers,
            Authorization: `Bearer ${token}`,
        });
    } else {
        throw new Error("Not logged in");
    }
}
