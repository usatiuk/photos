// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface IAPIErrorResponse<T> {
    data: null;
    error: string;
}

interface IAPISuccessResponse<T> {
    error: false;
    data: T;
}

export type IAPIResponse<T> = IAPIErrorResponse<T> | IAPISuccessResponse<T>;

export const IPhotosListPagination = 30;
