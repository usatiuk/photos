import {
    all,
    call,
    cancel,
    delay,
    fork,
    put,
    race,
    takeLatest,
} from "redux-saga/effects";
import { fetchPhotosList } from "~redux/api/photos";
import {
    photosLoadFail,
    photosLoadSuccess,
    photosStartFetchingSpinner,
    PhotoTypes,
} from "./actions";

function* startSpinner() {
    yield delay(300);
    yield put(photosStartFetchingSpinner());
}

function* photosLoad() {
    try {
        const spinner = yield fork(startSpinner);

        const { response, timeout } = yield race({
            response: call(fetchPhotosList),
            timeout: delay(10000),
        });

        yield cancel(spinner);

        if (timeout) {
            yield put(photosLoadFail("Timeout"));
            return;
        }
        if (response.data) {
            const photos = response.data;
            yield put(photosLoadSuccess(photos));
        } else {
            yield put(photosLoadFail(response.error));
        }
    } catch (e) {
        yield put(photosLoadFail("Internal error"));
    }
}

export function* photosSaga() {
    yield all([takeLatest(PhotoTypes.PHOTOS_LOAD_START, photosLoad)]);
}
