import { Reducer } from "redux";
import { IPhotoReqJSON } from "~../../src/entity/Photo";
import { UserAction, UserTypes } from "~redux/user/actions";
import { PhotoAction, PhotoTypes } from "./actions";

export interface IPhotosState {
    photos: IPhotoReqJSON[] | null;
    fetching: boolean;
    fetchingError: string | null;
    fetchingSpinner: boolean;

    deleteCache: Record<number, IPhotoReqJSON>;
}

const defaultPhotosState: IPhotosState = {
    photos: null,
    fetching: false,
    fetchingError: null,
    fetchingSpinner: false,

    deleteCache: {},
};

export const photosReducer: Reducer<IPhotosState, PhotoAction> = (
    state: IPhotosState = defaultPhotosState,
    action: PhotoAction | UserAction,
) => {
    switch (action.type) {
        case UserTypes.USER_LOGOUT:
            return defaultPhotosState;
        case PhotoTypes.PHOTOS_LOAD_START:
            return {
                ...defaultPhotosState,
                fetching: true,
                fetchingSpinner: false,
            };
        case PhotoTypes.PHOTOS_START_FETCHING_SPINNER:
            return { ...state, fetchingSpinner: true };
        case PhotoTypes.PHOTOS_LOAD_SUCCESS:
            return { ...defaultPhotosState, photos: action.photos };
        case PhotoTypes.PHOTOS_LOAD_FAIL:
            return { ...defaultPhotosState, fetchingError: action.error };
        case PhotoTypes.PHOTO_CREATE_SUCCESS:
            if (state.photos) {
                const photos = state.photos;
                const photosNoDup = photos.filter(
                    (p) => p.id !== action.photo.id,
                );
                const updPhotos = [action.photo, ...photosNoDup];
                return { ...state, photos: updPhotos };
            } else {
                return state;
            }
        case PhotoTypes.PHOTO_CREATE_FAIL:
            // TODO: Handle photo create fail
            return state;
        case PhotoTypes.PHOTO_UPLOAD_SUCCESS:
            if (state.photos) {
                const photos = state.photos;
                const photosNoDup = photos.filter(
                    (p) => p.id !== action.photo.id,
                );
                const updPhotos = [action.photo, ...photosNoDup];
                return { ...state, photos: updPhotos };
            } else {
                return state;
            }
        case PhotoTypes.PHOTO_DELETE_START:
            if (state.photos) {
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
                        photos: photosCleaned,
                        deleteCache: delCache,
                    };
                } else {
                    return state;
                }
            } else {
                return state;
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
            let photos: IPhotoReqJSON[] = [];
            if (state.photos) {
                photos = [...state.photos];
            }
            if (delCache[action.photo.id]) {
                photos = [...photos, delCache[action.photo.id]];
                delete delCache[action.photo.id];
            }
            return { ...state, deleteCache: delCache, photos };
            break;
        }
        case PhotoTypes.PHOTO_UPLOAD_FAIL:
            // TODO: Handle photo upload fail
            return state;
        default:
            return state;
    }
    return state;
};
