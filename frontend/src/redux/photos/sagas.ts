import {
    all,
    call,
    cancel,
    delay,
    fork,
    put,
    race,
    takeLatest,
    takeEvery,
    take,
    select,
} from "redux-saga/effects";
import * as SparkMD5 from "spark-md5";
import {
    createPhoto,
    deletePhoto,
    fetchPhoto,
    fetchPhotosList,
    uploadPhoto,
} from "~redux/api/photos";
import {
    IPhotoDeleteStartAction,
    IPhotoLoadStartAction,
    IPhotosUploadStartAction,
    photoCreateFail,
    photoCreateQueue,
    photoCreateStart,
    photoCreateSuccess,
    photoDeleteFail,
    photoDeleteSuccess,
    photoLoadFail,
    photoLoadSuccess,
    photosLoadFail,
    photosLoadSuccess,
    photosStartFetchingSpinner,
    PhotoTypes,
    photoUploadFail,
    photoUploadFailWithFile,
    photoUploadQueue,
    photoUploadStart,
    photoUploadSuccess,
} from "./actions";
import { IPhotosNewRespBody } from "~../../src/routes/photos";

// Thanks, https://dev.to/qortex/compute-md5-checksum-for-a-file-in-typescript-59a4
function computeChecksumMd5(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const chunkSize = 2097152; // Read in chunks of 2MB
        const spark = new SparkMD5.ArrayBuffer();
        const fileReader = new FileReader();

        let cursor = 0; // current cursor in file

        fileReader.onerror = function (): void {
            reject("MD5 computation failed - error reading the file");
        };

        // read chunk starting at `cursor` into memory
        function processChunk(chunk_start: number): void {
            const chunk_end = Math.min(file.size, chunk_start + chunkSize);
            fileReader.readAsArrayBuffer(file.slice(chunk_start, chunk_end));
        }

        // when it's available in memory, process it
        // If using TS >= 3.6, you can use `FileReaderProgressEvent` type instead
        // of `any` for `e` variable, otherwise stick with `any`
        // See https://github.com/Microsoft/TypeScript/issues/25510
        fileReader.onload = function (e: ProgressEvent<FileReader>): void {
            if (e.target?.result) {
                spark.append(e.target.result as ArrayBuffer); // Accumulate chunk to md5 computation
            }
            cursor += chunkSize; // Move past this chunk

            if (cursor < file.size) {
                // Enqueue next chunk to be accumulated
                processChunk(cursor);
            } else {
                // Computation ended, last chunk has been processed. Return as Promise value.
                // This returns the base64 encoded md5 hash, which is what
                // Rails ActiveStorage or cloud services expect
                // resolve(btoa(spark.end(true)));

                // If you prefer the hexdigest form (looking like
                // '7cf530335b8547945f1a48880bc421b2'), replace the above line with:
                resolve(spark.end());
            }
        };

        processChunk(0);
    });
}

function computeSize(f: File) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = window.URL.createObjectURL(f);
        img.onload = (e) => {
            const { naturalWidth, naturalHeight } = img;
            if (!naturalWidth || !naturalHeight) {
                reject("Error loading image");
            }
            resolve(`${naturalWidth}x${naturalHeight}`);
        };
        img.onerror = (e) => {
            reject("Error loading image");
        };
    });
}

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

function* photoLoad(action: IPhotoLoadStartAction) {
    try {
        //const spinner = yield fork(startSpinner);

        const { response, timeout } = yield race({
            response: call(fetchPhoto, action.id),
            timeout: delay(10000),
        });

        //yield cancel(spinner);

        if (timeout) {
            yield put(photoLoadFail(action.id, "Timeout"));
            return;
        }
        if (response.data) {
            const photo = response.data;
            yield put(photoLoadSuccess(photo));
        } else {
            yield put(photoLoadFail(action.id, response.error));
        }
    } catch (e) {
        yield put(photoLoadFail(action.id, "Internal error"));
    }
}

function* photoCreate() {
    const store = yield select();
    const photosCreating = store.photos.photosCreating;
    if (photosCreating < 2) {
        const createQueue = store.photos.photoCreateQueue as File[];
        if (createQueue.length === 0) {
            return;
        }
        const f = createQueue[0];
        yield put(photoCreateStart(f));
        try {
            const hash = yield call(computeChecksumMd5, f);
            const size = yield call(computeSize, f);
            const format = f.type;

            const { response, timeout } = yield race({
                response: call(createPhoto, hash, size, format),
                timeout: delay(10000),
            });

            if (timeout) {
                yield put(photoCreateFail(f, "Timeout"));
                return;
            }
            if (response.data || response.error === "Photo already exists") {
                const photo = (response as IPhotosNewRespBody).data;
                yield put(photoCreateSuccess(photo, f));
                yield put(photoUploadQueue(f, photo.id));
            } else {
                yield put(photoCreateFail(f, response.error));
            }
        } catch (e) {
            yield put(photoCreateFail(f, "Internal error"));
        }
    }
}

function* photoUpload() {
    const store = yield select();
    const photosUploading = store.photos.photosUploading;
    if (photosUploading < 2) {
        const createQueue = store.photos.photoUploadQueue as Record<
            number,
            File
        >;
        if (Object.keys(createQueue).length === 0) {
            return;
        }
        const pId = parseInt(Object.keys(createQueue)[0]);
        const f = createQueue[pId];
        yield put(photoUploadStart(f, pId));
        try {
            const { response, timeout } = yield race({
                response: call(uploadPhoto, f, pId),
                timeout: delay(10000),
            });

            if (timeout) {
                yield put(photoUploadFailWithFile(pId, f, "Timeout"));
                return;
            }
            if (response.data) {
                const photo = response.data;
                yield put(photoUploadSuccess(photo));
            } else {
                yield put(photoUploadFailWithFile(pId, f, response.error));
            }
        } catch (e) {
            yield put(photoUploadFailWithFile(pId, f, "Internal error"));
        }
    }
}

function* photosUpload(action: IPhotosUploadStartAction) {
    const files = Array.from(action.files);
    for (const file of files) {
        yield put(photoCreateQueue(file));
    }
}

function* photoDelete(action: IPhotoDeleteStartAction) {
    try {
        const { cancelled } = yield race({
            timeout: delay(3000),
            cancelled: take(PhotoTypes.PHOTO_DELETE_CANCEL),
        });

        if (!cancelled) {
            const { response, timeout } = yield race({
                response: call(deletePhoto, action.photo),
                timeout: delay(10000),
            });

            if (timeout) {
                yield put(photoDeleteFail(action.photo, "Timeout"));
                return;
            }

            if (response) {
                if (response.data == null) {
                    yield put(photoDeleteFail(action.photo, response.error));
                } else {
                    yield put(photoDeleteSuccess(action.photo));
                }
            }
        }
    } catch (e) {
        yield put(photoDeleteFail(action.photo, "Internal error"));
    }
}

export function* photosSaga() {
    yield all([
        takeLatest(PhotoTypes.PHOTOS_LOAD_START, photosLoad),
        takeLatest(PhotoTypes.PHOTOS_UPLOAD_START, photosUpload),
        takeLatest(PhotoTypes.PHOTO_LOAD_START, photoLoad),
        takeEvery(PhotoTypes.PHOTO_DELETE_START, photoDelete),
        takeEvery(PhotoTypes.PHOTO_CREATE_QUEUE, photoCreate),
        takeEvery(PhotoTypes.PHOTO_CREATE_SUCCESS, photoCreate),
        takeEvery(PhotoTypes.PHOTO_CREATE_FAIL, photoCreate),
        takeEvery(PhotoTypes.PHOTO_UPLOAD_QUEUE, photoUpload),
        takeEvery(PhotoTypes.PHOTO_UPLOAD_SUCCESS, photoUpload),
        takeEvery(PhotoTypes.PHOTO_UPLOAD_FAIL, photoUpload),
    ]);
}
