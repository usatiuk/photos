import { IPhotoReqJSON } from "~../../src/entity/Photo";
import {
    IPhotosByIDDeleteRespBody,
    IPhotosByIDGetRespBody,
    IPhotosListRespBody,
    IPhotosNewRespBody,
    IPhotosUploadRespBody,
} from "~../../src/routes/photos";
import { apiRoot } from "~env";
import { fetchJSONAuth } from "./utils";

export function getPhotoImgPath(photo: IPhotoReqJSON): string {
    return `${apiRoot}/photos/showByID/${photo.id}/${photo.accessToken}`;
}

export function getPhotoThumbPath(photo: IPhotoReqJSON, size: number): string {
    return `${apiRoot}/photos/showByID/${photo.id}/${
        photo.accessToken
    }?size=${size.toString()}`;
}

export async function fetchPhotosList(
    skip: number,
    num: number,
): Promise<IPhotosListRespBody> {
    const params = new URLSearchParams({
        skip: skip.toString(),
        num: num.toString(),
    });
    return fetchJSONAuth(`/photos/list?${params.toString()}`, "GET");
}

export async function fetchPhoto(id: number): Promise<IPhotosByIDGetRespBody> {
    return fetchJSONAuth(`/photos/byID/${id}`, "GET");
}

export async function createPhoto(
    hash: string,
    size: string,
    format: string,
): Promise<IPhotosNewRespBody> {
    return fetchJSONAuth("/photos/new", "POST", { hash, size, format });
}

export async function uploadPhoto(
    file: File,
    id: number,
): Promise<IPhotosUploadRespBody> {
    return fetchJSONAuth(`/photos/upload/${id}`, "POST", file);
}

export async function deletePhoto(
    photo: IPhotoReqJSON,
): Promise<IPhotosByIDDeleteRespBody> {
    return fetchJSONAuth(`/photos/byID/${photo.id}`, "DELETE");
}
