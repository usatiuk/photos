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
} from "redux-saga/effects";
import * as SparkMD5 from "spark-md5";
import {
    createPhoto,
    deletePhoto,
    fetchPhotosList,
    uploadPhoto,
} from "~redux/api/photos";
import {
    IPhotoDeleteStartAction,
    IPhotosUploadStartAction,
    photoCreateFail,
    photoCreateSuccess,
    photoDeleteFail,
    photoDeleteSuccess,
    photosLoadFail,
    photosLoadSuccess,
    photosStartFetchingSpinner,
    PhotoTypes,
    photoUploadFail,
    photoUploadFailWithFile,
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

function* photoUpload(f: File) {
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
            yield put(photoCreateSuccess(photo));

            try {
                const { response, timeout } = yield race({
                    response: call(uploadPhoto, f, photo.id),
                    timeout: delay(10000),
                });

                if (timeout) {
                    yield put(photoUploadFailWithFile(photo, f, "Timeout"));
                    return;
                }
                if (response.data) {
                    const photo = response.data;
                    yield put(photoUploadSuccess(photo));
                } else {
                    yield put(
                        photoUploadFailWithFile(photo, f, response.error),
                    );
                }
            } catch (e) {
                yield put(photoUploadFailWithFile(photo, f, "Internal error"));
            }
        } else {
            yield put(photoCreateFail(f, response.error));
        }
    } catch (e) {
        yield put(photoCreateFail(f, "Internal error"));
    }
}

function* photosUpload(action: IPhotosUploadStartAction) {
    const files = Array.from(action.files);
    yield all(files.map((f) => call(photoUpload, f)));
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
        takeEvery(PhotoTypes.PHOTO_DELETE_START, photoDelete),
    ]);
}
