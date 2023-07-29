interface IAPIErrorResponse {
    data: null;
    error: string;
}

interface IAPISuccessResponse<T> {
    error: false;
    data: T;
}

export type IAPIResponse<T> = IAPIErrorResponse | IAPISuccessResponse<T>;

export interface IPhotoJSON {
    id: number;
    user: number;
    hash: string;
    size: string;
    format: string;
    createdAt: number;
    editedAt: number;
    shotAt: number;
    uploaded: boolean;
}

export interface IPhotoReqJSON extends IPhotoJSON {
    accessToken: string;
}

export interface IUserJSON {
    id: number;
    username: string;
    isAdmin: boolean;
}

export interface IUserJWT extends IUserJSON {
    ext: number;
    iat: number;
}

export interface IUserAuthJSON extends IUserJSON {
    jwt: string;
}
export interface IPhotosNewPostBody {
    hash: string | undefined;
    size: string | undefined;
    format: string | undefined;
}
export type IPhotosNewRespBody = IAPIResponse<IPhotoReqJSON>;
export type IPhotosUploadRespBody = IAPIResponse<IPhotoReqJSON>;
export type IPhotosListRespBody = IAPIResponse<IPhotoReqJSON[]>;
export type IPhotosByIDGetRespBody = IAPIResponse<IPhotoReqJSON>;
export type IPhotoByIDDeleteRespBody = IAPIResponse<boolean>;
export type IPhotosDeleteRespBody = IAPIResponse<boolean>;
export type IUserGetRespBody = IAPIResponse<IUserAuthJSON>;
export type IUserLoginRespBody = IAPIResponse<IUserAuthJSON>;
export interface IUserSignupBody {
    username: string | undefined;
    password: string | undefined;
    email: string | undefined;
}
export type IUserSignupRespBody = IAPIResponse<IUserAuthJSON>;
export interface IUserEditBody {
    password: string | undefined;
}
export type IUserEditRespBody = IAPIResponse<IUserAuthJSON>;
export interface IUserLoginBody {
    username: string | undefined;
    password: string | undefined;
}
export interface IPhotosDeleteBody {
    photos: IPhotoReqJSON[];
}

export const IPhotosListPagination = 50;
