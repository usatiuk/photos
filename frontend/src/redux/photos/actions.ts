import { Action } from "redux";
import { TPhotoReqJSON } from "~src/shared/types";
import {
    showPhotoCreateFailToast,
    showPhotoUploadFileFailToast,
    showPhotoUploadJSONFailToast,
} from "~src/AppToaster";

export enum PhotoTypes {
    PHOTOS_LOAD_START = "PHOTOS_LOAD",
    PHOTOS_LOAD_SUCCESS = "PHOTOS_LOAD_SUCCESS",
    PHOTOS_LOAD_FAIL = "PHOTOS_LOAD_FAIL",
    PHOTO_LOAD_START = "PHOTO_LOAD",
    PHOTO_LOAD_SUCCESS = "PHOTO_LOAD_SUCCESS",
    PHOTO_LOAD_FAIL = "PHOTO_LOAD_FAIL",
    PHOTOS_UPLOAD_START = "PHOTOS_UPLOAD",
    PHOTO_CREATE_QUEUE = "PHOTO_CREATE_QUEUE",
    PHOTO_CREATE_START = "PHOTO_CREATE_START",
    PHOTO_CREATE_SUCCESS = "PHOTO_CREATE_SUCCESS",
    PHOTO_CREATE_FAIL = "PHOTO_CREATE_FAIL",
    PHOTO_UPLOAD_QUEUE = "PHOTO_UPLOAD_QUEUE",
    PHOTO_UPLOAD_START = "PHOTO_UPLOAD_START",
    PHOTO_UPLOAD_SUCCESS = "PHOTO_UPLOAD_SUCCESS",
    PHOTO_UPLOAD_FAIL = "PHOTO_UPLOAD_FAIL",
    PHOTOS_START_FETCHING_SPINNER = "PHOTOS_START_FETCHING_SPINNER",
    PHOTOS_DELETE_START = "PHOTOS_DELETE_START",
    PHOTOS_DELETE_SUCCESS = "PHOTOS_DELETE_SUCCESS",
    PHOTOS_DELETE_FAIL = "PHOTOS_DELETE_FAIL",
    PHOTOS_DELETE_CANCEL = "PHOTOS_DELETE_CANCEL",
}

export interface TPhotosLoadStartAction extends Action {
    type: PhotoTypes.PHOTOS_LOAD_START;
}

export interface TPhotosLoadSuccessAction extends Action {
    type: PhotoTypes.PHOTOS_LOAD_SUCCESS;
    photos: TPhotoReqJSON[];
}

export interface TPhotosLoadFailAction extends Action {
    type: PhotoTypes.PHOTOS_LOAD_FAIL;
    error: string;
}

export interface TPhotoLoadStartAction extends Action {
    type: PhotoTypes.PHOTO_LOAD_START;
    id: number;
}

export interface TPhotoLoadSuccessAction extends Action {
    type: PhotoTypes.PHOTO_LOAD_SUCCESS;
    photo: TPhotoReqJSON;
}

export interface TPhotoLoadFailAction extends Action {
    type: PhotoTypes.PHOTO_LOAD_FAIL;
    id: number;
    error: string;
}

export interface TPhotosUploadStartAction extends Action {
    type: PhotoTypes.PHOTOS_UPLOAD_START;
    files: FileList;
}

export interface TPhotoCreateQueue extends Action {
    type: PhotoTypes.PHOTO_CREATE_QUEUE;
    file: File;
}

export interface TPhotoUploadQueue extends Action {
    type: PhotoTypes.PHOTO_UPLOAD_QUEUE;
    file: File;
    id: number;
}

export interface TPhotoCreateStart extends Action {
    type: PhotoTypes.PHOTO_CREATE_START;
    file: File;
}

export interface TPhotoUploadStart extends Action {
    type: PhotoTypes.PHOTO_UPLOAD_START;
    file: File;
    id: number;
}

export interface TPhotoUploadSuccessAction extends Action {
    type: PhotoTypes.PHOTO_UPLOAD_SUCCESS;
    photo: TPhotoReqJSON;
}

export interface TPhotoUploadFailAction extends Action {
    type: PhotoTypes.PHOTO_UPLOAD_FAIL;
    photo: TPhotoReqJSON | number;
    error: string;
}

export interface TPhotoCreateSuccessAction extends Action {
    type: PhotoTypes.PHOTO_CREATE_SUCCESS;
    photo: TPhotoReqJSON;
    file: File;
}

export interface TPhotoCreateFailAction extends Action {
    type: PhotoTypes.PHOTO_CREATE_FAIL;
    file: File;
    error: string;
}

export interface TPhotosDeleteStartAction extends Action {
    type: PhotoTypes.PHOTOS_DELETE_START;
    photos: TPhotoReqJSON[];
}

export interface TPhotosDeleteSuccessAction extends Action {
    type: PhotoTypes.PHOTOS_DELETE_SUCCESS;
    photos: TPhotoReqJSON[];
}

export interface TPhotosDeleteFailAction extends Action {
    type: PhotoTypes.PHOTOS_DELETE_FAIL;
    photos: TPhotoReqJSON[];
    error?: string;
}

export interface TPhotosDeleteCancelAction extends Action {
    type: PhotoTypes.PHOTOS_DELETE_CANCEL;
    photos: TPhotoReqJSON[];
}

export interface TPhotosStartFetchingSpinner extends Action {
    type: PhotoTypes.PHOTOS_START_FETCHING_SPINNER;
}

export function photoCreateQueue(file: File): TPhotoCreateQueue {
    return { type: PhotoTypes.PHOTO_CREATE_QUEUE, file };
}

export function photoUploadQueue(file: File, id: number): TPhotoUploadQueue {
    return { type: PhotoTypes.PHOTO_UPLOAD_QUEUE, file, id };
}

export function photoCreateStart(file: File): TPhotoCreateStart {
    return { type: PhotoTypes.PHOTO_CREATE_START, file };
}

export function photoUploadStart(file: File, id: number): TPhotoUploadStart {
    return { type: PhotoTypes.PHOTO_UPLOAD_START, file, id };
}

export function photosLoadStart(): TPhotosLoadStartAction {
    return { type: PhotoTypes.PHOTOS_LOAD_START };
}

export function photoLoadStart(id: number): TPhotoLoadStartAction {
    return { type: PhotoTypes.PHOTO_LOAD_START, id };
}

export function photosUploadStart(files: FileList): TPhotosUploadStartAction {
    return { type: PhotoTypes.PHOTOS_UPLOAD_START, files };
}

export function photoUploadSuccess(
    photo: TPhotoReqJSON,
): TPhotoUploadSuccessAction {
    return { type: PhotoTypes.PHOTO_UPLOAD_SUCCESS, photo };
}

export function photoUploadFail(
    photo: TPhotoReqJSON | number,
    error: string,
): TPhotoUploadFailAction {
    showPhotoUploadJSONFailToast(photo, error);
    return { type: PhotoTypes.PHOTO_UPLOAD_FAIL, photo, error };
}

export function photoUploadFailWithFile(
    photo: TPhotoReqJSON | number,
    file: File,
    error: string,
): TPhotoUploadFailAction {
    showPhotoUploadFileFailToast(file, error);
    return { type: PhotoTypes.PHOTO_UPLOAD_FAIL, photo, error };
}

export function photoCreateSuccess(
    photo: TPhotoReqJSON,
    file: File,
): TPhotoCreateSuccessAction {
    return { type: PhotoTypes.PHOTO_CREATE_SUCCESS, photo, file };
}

export function photoCreateFail(
    file: File,
    error: string,
): TPhotoCreateFailAction {
    showPhotoCreateFailToast(file, error);
    return { type: PhotoTypes.PHOTO_CREATE_FAIL, file, error };
}

export function photosLoadSuccess(
    photos: TPhotoReqJSON[],
): TPhotosLoadSuccessAction {
    return { type: PhotoTypes.PHOTOS_LOAD_SUCCESS, photos };
}

export function photosLoadFail(error: string): TPhotosLoadFailAction {
    return { type: PhotoTypes.PHOTOS_LOAD_FAIL, error };
}

export function photoLoadSuccess(
    photo: TPhotoReqJSON,
): TPhotoLoadSuccessAction {
    return { type: PhotoTypes.PHOTO_LOAD_SUCCESS, photo };
}

export function photoLoadFail(id: number, error: string): TPhotoLoadFailAction {
    return { type: PhotoTypes.PHOTO_LOAD_FAIL, id, error };
}

export function photosDeleteStart(
    photos: TPhotoReqJSON[],
): TPhotosDeleteStartAction {
    return { type: PhotoTypes.PHOTOS_DELETE_START, photos };
}
export function photosDeleteSuccess(
    photos: TPhotoReqJSON[],
): TPhotosDeleteSuccessAction {
    return { type: PhotoTypes.PHOTOS_DELETE_SUCCESS, photos };
}
export function photosDeleteFail(
    photos: TPhotoReqJSON[],
    error?: string,
): TPhotosDeleteFailAction {
    return { type: PhotoTypes.PHOTOS_DELETE_FAIL, photos, error };
}

export function photosDeleteCancel(
    photos: TPhotoReqJSON[],
): TPhotosDeleteCancelAction {
    return { type: PhotoTypes.PHOTOS_DELETE_CANCEL, photos };
}

export function photosStartFetchingSpinner(): TPhotosStartFetchingSpinner {
    return { type: PhotoTypes.PHOTOS_START_FETCHING_SPINNER };
}

export type PhotoAction =
    | TPhotosLoadStartAction
    | TPhotosLoadFailAction
    | TPhotosLoadSuccessAction
    | TPhotosStartFetchingSpinner
    | TPhotosUploadStartAction
    | TPhotoCreateFailAction
    | TPhotoCreateSuccessAction
    | TPhotoUploadFailAction
    | TPhotoUploadSuccessAction
    | TPhotosDeleteFailAction
    | TPhotosDeleteStartAction
    | TPhotosDeleteSuccessAction
    | TPhotosDeleteCancelAction
    | TPhotoLoadFailAction
    | TPhotoLoadStartAction
    | TPhotoLoadSuccessAction
    | TPhotoUploadQueue
    | TPhotoCreateQueue
    | TPhotoCreateStart
    | TPhotoUploadStart;
