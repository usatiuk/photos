import { Reducer } from "redux";
import { TPhotoReqJSON } from "~/src/shared/types";
import { UserAction, UserTypes } from "~src/redux/user/actions";
import { PhotoAction, PhotoTypes } from "./actions";

export interface TPhotoState {
    fetching: boolean;
    fetchingError: string | null;
}

export interface TPhotosState {
    photos: TPhotoReqJSON[];

    photoStates: Record<number, TPhotoState>;

    overviewFetching: boolean;
    allPhotosLoaded: boolean;
    triedLoading: boolean;
    overviewFetchingError: string | null;
    overviewFetchingSpinner: boolean;

    photoCreateQueue: File[];
    photosCreating: number;
    photoUploadQueue: Record<number, File>;
    photosUploading: number;

    deleteCache: Record<number, TPhotoReqJSON>;
}

const defaultPhotosState: TPhotosState = {
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

export function sortPhotos(photos: TPhotoReqJSON[]): TPhotoReqJSON[] {
    return [...photos].sort((a, b) => b.shotAt - a.shotAt);
}

export const photosReducer: Reducer<TPhotosState, PhotoAction> = (
    state: TPhotosState = defaultPhotosState,
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
        case PhotoTypes.PHOTOS_DELETE_START: {
            const photos = state.photos;
            const photoIds = action.photos.map((p) => p.id);
            const delPhotos = photos.find((p) => photoIds.includes(p.id));
            if (delPhotos) {
                const photosCleaned = photos.filter(
                    (p) => !photoIds.includes(p.id),
                );
                const delCache = { ...state.deleteCache };
                for (const photo of action.photos) {
                    delCache[photo.id] = photo;
                }
                return {
                    ...state,
                    photos: sortPhotos(photosCleaned),
                    deleteCache: delCache,
                };
            } else {
                return state;
            }
        }
        case PhotoTypes.PHOTOS_DELETE_SUCCESS: {
            const delCache = { ...state.deleteCache };
            for (const photo of action.photos) {
                if (delCache[photo.id]) {
                    delete delCache[photo.id];
                }
            }
            return { ...state, deleteCache: delCache };
            break;
        }
        case PhotoTypes.PHOTOS_DELETE_FAIL:
        case PhotoTypes.PHOTOS_DELETE_CANCEL: {
            const delCache = { ...state.deleteCache };
            let photos: TPhotoReqJSON[] = [...state.photos];
            for (const photo of action.photos) {
                if (delCache[photo.id]) {
                    photos = sortPhotos([...photos, delCache[photo.id]]);
                    delete delCache[photo.id];
                }
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
