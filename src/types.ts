export interface IAPIResponse<T> {
    data: T | null;
    error: string | null;
}
