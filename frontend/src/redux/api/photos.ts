import {
    PhotosByIDGetRespBody,
    PhotosDeleteRespBody,
    PhotosListRespBody,
    PhotosNewRespBody,
    PhotosUploadRespBody,
    TPhotoReqJSON,
} from "~/src/shared/types";
import {
    TPhotosByIDGetRespBody,
    TPhotosDeleteRespBody,
    TPhotosListRespBody,
    TPhotosNewRespBody,
    TPhotosUploadRespBody,
} from "~/src/shared/types";
import { apiRoot } from "~src/env";
import { fetchJSONAuth } from "./utils";

export function getPhotoImgPath(photo: TPhotoReqJSON): string {
    return `${apiRoot}/photos/showByID/${photo.id}/${photo.accessToken}`;
}

export function getPhotoThumbPath(photo: TPhotoReqJSON, size: number): string {
    return `${apiRoot}/photos/showByID/${photo.id}/${
        photo.accessToken
    }?size=${size.toString()}`;
}

export async function fetchPhotosList(
    skip: number,
    num: number,
): Promise<TPhotosListRespBody> {
    const params = new URLSearchParams({
        skip: skip.toString(),
        num: num.toString(),
    });
    return fetchJSONAuth(
        `/photos/list?${params.toString()}`,
        "GET",
        PhotosListRespBody,
    );
}

export async function fetchPhoto(id: number): Promise<TPhotosByIDGetRespBody> {
    return fetchJSONAuth(`/photos/byID/${id}`, "GET", PhotosByIDGetRespBody);
}

export async function createPhoto(
    hash: string,
    size: string,
    format: string,
): Promise<TPhotosNewRespBody> {
    return fetchJSONAuth("/photos/new", "POST", PhotosNewRespBody, {
        hash,
        size,
        format,
    });
}

export async function uploadPhoto(
    file: File,
    id: number,
): Promise<TPhotosUploadRespBody> {
    return fetchJSONAuth(
        `/photos/upload/${id}`,
        "POST",
        PhotosUploadRespBody,
        file,
    );
}

export async function deletePhotos(
    photos: TPhotoReqJSON[],
): Promise<TPhotosDeleteRespBody> {
    return fetchJSONAuth(`/photos/delete`, "POST", PhotosDeleteRespBody, {
        photos,
    });
}
