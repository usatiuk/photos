import { Action } from "redux";
import { IPhotoReqJSON, Photo } from "../../../../src/entity/Photo";
import {
    showPhotoCreateFailToast,
    showPhotoUploadFileFailToast,
    showPhotoUploadJSONFailToast,
} from "../../AppToaster";

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
    PHOTO_DELETE_START = "PHOTO_DELETE_START",
    PHOTO_DELETE_SUCCESS = "PHOTO_DELETE_SUCCESS",
    PHOTO_DELETE_FAIL = "PHOTO_DELETE_FAIL",
    PHOTO_DELETE_CANCEL = "PHOTO_DELETE_CANCEL",
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

export interface IPhotoLoadStartAction extends Action {
    type: PhotoTypes.PHOTO_LOAD_START;
    id: number;
}

export interface IPhotoLoadSuccessAction extends Action {
    type: PhotoTypes.PHOTO_LOAD_SUCCESS;
    photo: IPhotoReqJSON;
}

export interface IPhotoLoadFailAction extends Action {
    type: PhotoTypes.PHOTO_LOAD_FAIL;
    id: number;
    error: string;
}

export interface IPhotosUploadStartAction extends Action {
    type: PhotoTypes.PHOTOS_UPLOAD_START;
    files: FileList;
}

export interface IPhotoCreateQueue extends Action {
    type: PhotoTypes.PHOTO_CREATE_QUEUE;
    file: File;
}

export interface IPhotoUploadQueue extends Action {
    type: PhotoTypes.PHOTO_UPLOAD_QUEUE;
    file: File;
    id: number;
}

export interface IPhotoCreateStart extends Action {
    type: PhotoTypes.PHOTO_CREATE_START;
    file: File;
}

export interface IPhotoUploadStart extends Action {
    type: PhotoTypes.PHOTO_UPLOAD_START;
    file: File;
    id: number;
}

export interface IPhotoUploadSuccessAction extends Action {
    type: PhotoTypes.PHOTO_UPLOAD_SUCCESS;
    photo: IPhotoReqJSON;
}

export interface IPhotoUploadFailAction extends Action {
    type: PhotoTypes.PHOTO_UPLOAD_FAIL;
    photo: IPhotoReqJSON | number;
    error: string;
}

export interface IPhotoCreateSuccessAction extends Action {
    type: PhotoTypes.PHOTO_CREATE_SUCCESS;
    photo: IPhotoReqJSON;
    file: File;
}

export interface IPhotoCreateFailAction extends Action {
    type: PhotoTypes.PHOTO_CREATE_FAIL;
    file: File;
    error: string;
}

export interface IPhotoDeleteStartAction extends Action {
    type: PhotoTypes.PHOTO_DELETE_START;
    photo: IPhotoReqJSON;
}

export interface IPhotoDeleteSuccessAction extends Action {
    type: PhotoTypes.PHOTO_DELETE_SUCCESS;
    photo: IPhotoReqJSON;
}

export interface IPhotoDeleteFailAction extends Action {
    type: PhotoTypes.PHOTO_DELETE_FAIL;
    photo: IPhotoReqJSON;
    error?: string;
}

export interface IPhotoDeleteCancelAction extends Action {
    type: PhotoTypes.PHOTO_DELETE_CANCEL;
    photo: IPhotoReqJSON;
}

export interface IPhotosStartFetchingSpinner extends Action {
    type: PhotoTypes.PHOTOS_START_FETCHING_SPINNER;
}

export function photoCreateQueue(file: File): IPhotoCreateQueue {
    return { type: PhotoTypes.PHOTO_CREATE_QUEUE, file };
}

export function photoUploadQueue(file: File, id: number): IPhotoUploadQueue {
    return { type: PhotoTypes.PHOTO_UPLOAD_QUEUE, file, id };
}

export function photoCreateStart(file: File): IPhotoCreateStart {
    return { type: PhotoTypes.PHOTO_CREATE_START, file };
}

export function photoUploadStart(file: File, id: number): IPhotoUploadStart {
    return { type: PhotoTypes.PHOTO_UPLOAD_START, file, id };
}

export function photosLoadStart(): IPhotosLoadStartAction {
    return { type: PhotoTypes.PHOTOS_LOAD_START };
}

export function photoLoadStart(id: number): IPhotoLoadStartAction {
    return { type: PhotoTypes.PHOTO_LOAD_START, id };
}

export function photosUploadStart(files: FileList): IPhotosUploadStartAction {
    return { type: PhotoTypes.PHOTOS_UPLOAD_START, files };
}

export function photoUploadSuccess(
    photo: IPhotoReqJSON,
): IPhotoUploadSuccessAction {
    return { type: PhotoTypes.PHOTO_UPLOAD_SUCCESS, photo };
}

export function photoUploadFail(
    photo: IPhotoReqJSON | number,
    error: string,
): IPhotoUploadFailAction {
    showPhotoUploadJSONFailToast(photo, error);
    return { type: PhotoTypes.PHOTO_UPLOAD_FAIL, photo, error };
}

export function photoUploadFailWithFile(
    photo: IPhotoReqJSON | number,
    file: File,
    error: string,
): IPhotoUploadFailAction {
    showPhotoUploadFileFailToast(file, error);
    return { type: PhotoTypes.PHOTO_UPLOAD_FAIL, photo, error };
}

export function photoCreateSuccess(
    photo: IPhotoReqJSON,
    file: File,
): IPhotoCreateSuccessAction {
    return { type: PhotoTypes.PHOTO_CREATE_SUCCESS, photo, file };
}

export function photoCreateFail(
    file: File,
    error: string,
): IPhotoCreateFailAction {
    showPhotoCreateFailToast(file, error);
    return { type: PhotoTypes.PHOTO_CREATE_FAIL, file, error };
}

export function photosLoadSuccess(
    photos: IPhotoReqJSON[],
): IPhotosLoadSuccessAction {
    return { type: PhotoTypes.PHOTOS_LOAD_SUCCESS, photos };
}

export function photosLoadFail(error: string): IPhotosLoadFailAction {
    return { type: PhotoTypes.PHOTOS_LOAD_FAIL, error };
}

export function photoLoadSuccess(
    photo: IPhotoReqJSON,
): IPhotoLoadSuccessAction {
    return { type: PhotoTypes.PHOTO_LOAD_SUCCESS, photo };
}

export function photoLoadFail(id: number, error: string): IPhotoLoadFailAction {
    return { type: PhotoTypes.PHOTO_LOAD_FAIL, id, error };
}

export function photoDeleteStart(
    photo: IPhotoReqJSON,
): IPhotoDeleteStartAction {
    return { type: PhotoTypes.PHOTO_DELETE_START, photo };
}
export function photoDeleteSuccess(
    photo: IPhotoReqJSON,
): IPhotoDeleteSuccessAction {
    return { type: PhotoTypes.PHOTO_DELETE_SUCCESS, photo };
}
export function photoDeleteFail(
    photo: IPhotoReqJSON,
    error?: string,
): IPhotoDeleteFailAction {
    return { type: PhotoTypes.PHOTO_DELETE_FAIL, photo, error };
}

export function photoDeleteCancel(
    photo: IPhotoReqJSON,
): IPhotoDeleteCancelAction {
    return { type: PhotoTypes.PHOTO_DELETE_CANCEL, photo };
}

export function photosStartFetchingSpinner(): IPhotosStartFetchingSpinner {
    return { type: PhotoTypes.PHOTOS_START_FETCHING_SPINNER };
}

export type PhotoAction =
    | IPhotosLoadStartAction
    | IPhotosLoadFailAction
    | IPhotosLoadSuccessAction
    | IPhotosStartFetchingSpinner
    | IPhotosUploadStartAction
    | IPhotoCreateFailAction
    | IPhotoCreateSuccessAction
    | IPhotoUploadFailAction
    | IPhotoUploadSuccessAction
    | IPhotoDeleteFailAction
    | IPhotoDeleteStartAction
    | IPhotoDeleteSuccessAction
    | IPhotoDeleteCancelAction
    | IPhotoLoadFailAction
    | IPhotoLoadStartAction
    | IPhotoLoadSuccessAction
    | IPhotoUploadQueue
    | IPhotoCreateQueue
    | IPhotoCreateStart
    | IPhotoUploadStart;
