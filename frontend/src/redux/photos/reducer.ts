import { Reducer } from "redux";
import { IPhotoJSON, IPhotoReqJSON } from "~../../src/entity/Photo";
import { UserAction, UserTypes } from "~redux/user/actions";
import { PhotoAction, PhotoTypes } from "./actions";

export interface IPhotoState {
    fetching: boolean;
    fetchingError: string | null;
}

export interface IPhotosState {
    photos: IPhotoReqJSON[];

    photoStates: Record<number, IPhotoState>;

    overviewFetching: boolean;
    allPhotosLoaded: boolean;
    triedLoading: boolean;
    overviewFetchingError: string | null;
    overviewFetchingSpinner: boolean;

    photoCreateQueue: File[];
    photosCreating: number;
    photoUploadQueue: Record<number, File>;
    photosUploading: number;

    deleteCache: Record<number, IPhotoReqJSON>;
}

const defaultPhotosState: IPhotosState = {
    photos: [],
    allPhotosLoaded: false,
    overviewFetching: false,
    triedLoading: false,
    overviewFetchingError: null,
    overviewFetchingSpinner: false,

    photoCreateQueue: [],
    photosCreating: 0,
    photoUploadQueue: {},
    photosUploading: 0,

    photoStates: {},

    deleteCache: {},
};

export function sortPhotos(photos: IPhotoReqJSON[]): IPhotoReqJSON[] {
    return [...photos].sort((a, b) => b.shotAt - a.shotAt);
}

export const photosReducer: Reducer<IPhotosState, PhotoAction> = (
    state: IPhotosState = defaultPhotosState,
    action: PhotoAction | UserAction,
) => {
    switch (action.type) {
        case UserTypes.USER_LOGOUT:
            return defaultPhotosState;
        case PhotoTypes.PHOTOS_LOAD_START:
            return {
                ...state,
                overviewFetching: true,
                triedLoading: true,
                overviewFetchingSpinner: false,
            };
        case PhotoTypes.PHOTOS_START_FETCHING_SPINNER:
            return { ...state, overviewFetchingSpinner: true };
        case PhotoTypes.PHOTOS_LOAD_SUCCESS: {
            let { allPhotosLoaded } = state;
            if (action.photos.length === 0) {
                allPhotosLoaded = true;
            }
            const oldPhotos = state.photos ? state.photos : [];
            const updPhotos = sortPhotos([...oldPhotos, ...action.photos]);
            return {
                ...state,
                photos: updPhotos,
                triedLoading: true,
                allPhotosLoaded,
                overviewFetching: false,
            };
        }
        case PhotoTypes.PHOTOS_LOAD_FAIL:
            return {
                ...defaultPhotosState,
                triedLoading: true,
                overviewFetchingError: action.error,
            };

        case PhotoTypes.PHOTO_LOAD_START: {
            const { photoStates } = state;
            photoStates[action.id] = {
                fetching: true,
                fetchingError: null,
            };
            return {
                ...state,
                photoStates,
            };
        }
        case PhotoTypes.PHOTO_LOAD_SUCCESS: {
            const { photoStates } = state;
            photoStates[action.photo.id] = {
                fetching: false,
                fetchingError: null,
            };
            const photos = state.photos;
            const photosNoDup = photos.filter((p) => p.id !== action.photo.id);
            const updPhotos = sortPhotos([action.photo, ...photosNoDup]);
            return { ...state, photos: updPhotos, photoStates };
        }
        case PhotoTypes.PHOTO_LOAD_FAIL: {
            const { photoStates } = state;
            photoStates[action.id] = {
                fetching: false,
                fetchingError: action.error,
            };
            return {
                ...state,
                photoStates,
            };
        }
        case PhotoTypes.PHOTO_CREATE_QUEUE: {
            const { photoCreateQueue } = state;
            return {
                ...state,
                photoCreateQueue: [...photoCreateQueue, action.file],
            };
            break;
        }
        case PhotoTypes.PHOTO_CREATE_START: {
            const { photoCreateQueue } = state;
            const cleanQueue = photoCreateQueue.filter((f) => f != action.file);

            return {
                ...state,
                photosCreating: state.photosCreating + 1,
                photoCreateQueue: cleanQueue,
            };
            break;
        }
        case PhotoTypes.PHOTO_UPLOAD_START: {
            const newQueue = state.photoUploadQueue;
            delete newQueue[action.id];

            return {
                ...state,
                photosUploading: state.photosUploading + 1,
                photoUploadQueue: newQueue,
            };
            break;
        }
        case PhotoTypes.PHOTO_UPLOAD_QUEUE: {
            const newQueue = state.photoUploadQueue;
            newQueue[action.id] = action.file;
            return {
                ...state,
                photoUploadQueue: newQueue,
            };
            break;
        }
        case PhotoTypes.PHOTO_CREATE_SUCCESS: {
            const { photoCreateQueue } = state;
            const cleanQueue = photoCreateQueue.filter((f) => f != action.file);

            const photos = state.photos;
            const photosNoDup = photos.filter((p) => p.id !== action.photo.id);
            const updPhotos = sortPhotos([action.photo, ...photosNoDup]);
            return {
                ...state,
                photos: updPhotos,
                photoCreateQueue: cleanQueue,
                photosCreating: state.photosCreating - 1,
            };
        }
        case PhotoTypes.PHOTO_CREATE_FAIL: {
            // TODO: Handle photo create fail
            const { photoCreateQueue } = state;
            const cleanQueue = photoCreateQueue.filter((f) => f != action.file);
            return {
                ...state,
                photoCreateQueue: cleanQueue,
                photosCreating: state.photosCreating - 1,
            };
        }
        case PhotoTypes.PHOTO_UPLOAD_SUCCESS: {
            const newQueue = state.photoUploadQueue;
            delete newQueue[action.photo.id];
            const photos = state.photos;
            const photosNoDup = photos.filter((p) => p.id !== action.photo.id);
            const updPhotos = sortPhotos([action.photo, ...photosNoDup]);
            return {
                ...state,
                photos: updPhotos,
                photoUploadQueue: newQueue,
                photosUploading: state.photosUploading - 1,
            };
        }
        case PhotoTypes.PHOTO_DELETE_START: {
            const photos = state.photos;
            const delPhoto = photos.find((p) => p.id === action.photo.id);
            if (delPhoto) {
                const photosCleaned = photos.filter(
                    (p) => p.id !== action.photo.id,
                );
                const delCache = { ...state.deleteCache };
                delCache[delPhoto?.id] = delPhoto;
                return {
                    ...state,
                    photos: sortPhotos(photosCleaned),
                    deleteCache: delCache,
                };
            } else {
                return state;
            }
        }
        case PhotoTypes.PHOTO_DELETE_SUCCESS: {
            const delCache = { ...state.deleteCache };
            if (delCache[action.photo.id]) {
                delete delCache[action.photo.id];
            }
            return { ...state, deleteCache: delCache };
            break;
        }
        case PhotoTypes.PHOTO_DELETE_FAIL:
        case PhotoTypes.PHOTO_DELETE_CANCEL: {
            const delCache = { ...state.deleteCache };
            let photos: IPhotoReqJSON[] = [...state.photos];
            if (delCache[action.photo.id]) {
                photos = sortPhotos([...photos, delCache[action.photo.id]]);
                delete delCache[action.photo.id];
            }
            return { ...state, deleteCache: delCache, photos };
            break;
        }
        case PhotoTypes.PHOTO_UPLOAD_FAIL: {
            // TODO: Handle photo upload fail
            const newQueue = state.photoUploadQueue;
            if (typeof action.photo === "number") {
                delete newQueue[action.photo];
            } else {
                delete newQueue[action.photo.id];
            }
            return {
                ...state,
                photoUploadQueue: newQueue,
                photosUploading: state.photosUploading - 1,
            };
        }
        default:
            return state;
    }
    return state;
};
