import { Reducer } from "redux";
import { IPhotoReqJSON } from "~../../src/entity/Photo";
import { PhotoAction, PhotoTypes } from "./actions";

export interface IPhotosState {
    photos: IPhotoReqJSON[] | null;
    fetching: boolean;
    fetchingError: string | null;
    fetchingSpinner: boolean;
}

const defaultPhotosState: IPhotosState = {
    photos: null,
    fetching: false,
    fetchingError: null,
    fetchingSpinner: false,
};

export const photosReducer: Reducer<IPhotosState, PhotoAction> = (
    state: IPhotosState = defaultPhotosState,
    action: PhotoAction,
) => {
    switch (action.type) {
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
        default:
            return state;
    }
    return state;
};
