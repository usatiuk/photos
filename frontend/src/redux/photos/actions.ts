import { Action } from "redux";
import { IPhotoReqJSON, Photo } from "~../../src/entity/Photo";

export enum PhotoTypes {
    PHOTOS_LOAD_START = "PHOTOS_LOAD",
    PHOTOS_LOAD_SUCCESS = "PHOTOS_LOAD_SUCCESS",
    PHOTOS_LOAD_FAIL = "PHOTOS_LOAD_FAIL",
    PHOTOS_START_FETCHING_SPINNER = "PHOTOS_START_FETCHING_SPINNER",
}

export interface IPhotosLoadStartAction extends Action {
    type: PhotoTypes.PHOTOS_LOAD_START;
}

export interface IPhotosLoadSuccessAction extends Action {
    type: PhotoTypes.PHOTOS_LOAD_SUCCESS;
    photos: IPhotoReqJSON[];
}

export interface IPhotosLoadFailAction extends Action {
    type: PhotoTypes.PHOTOS_LOAD_FAIL;
    error: string;
}

export interface IPhotosStartFetchingSpinner extends Action {
    type: PhotoTypes.PHOTOS_START_FETCHING_SPINNER;
}

export function photosLoadStart(): IPhotosLoadStartAction {
    return { type: PhotoTypes.PHOTOS_LOAD_START };
}

export function photosLoadSuccess(
    photos: IPhotoReqJSON[],
): IPhotosLoadSuccessAction {
    return { type: PhotoTypes.PHOTOS_LOAD_SUCCESS, photos };
}

export function photosLoadFail(error: string): IPhotosLoadFailAction {
    return { type: PhotoTypes.PHOTOS_LOAD_FAIL, error };
}

export function photosStartFetchingSpinner(): IPhotosStartFetchingSpinner {
    return { type: PhotoTypes.PHOTOS_START_FETCHING_SPINNER };
}

export type PhotoAction =
    | IPhotosLoadStartAction
    | IPhotosLoadFailAction
    | IPhotosLoadSuccessAction
    | IPhotosStartFetchingSpinner;
