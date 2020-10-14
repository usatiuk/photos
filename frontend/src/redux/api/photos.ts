import { IPhotoReqJSON } from "~../../src/entity/Photo";
import { IPhotosListRespBody } from "~../../src/routes/photos";
import { apiRoot } from "~env";
import { fetchJSONAuth } from "./utils";

export function getPhotoImgPath(photo: IPhotoReqJSON): string {
    return `${apiRoot}/photos/showByID/${photo.id}/${photo.accessToken}`;
}

export async function fetchPhotosList(): Promise<IPhotosListRespBody> {
    return (fetchJSONAuth("/photos/list", "GET") as unknown) as Promise<
        IPhotosListRespBody
    >;
}
