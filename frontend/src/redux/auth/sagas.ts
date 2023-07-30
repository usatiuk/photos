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
import { login, signup } from "~src/redux/api/auth";

import {
    authFail,
    authSuccess,
    AuthTypes,
    IAuthStartAction,
    ISignupStartAction,
    startFormSpinner,
} from "./actions";

function* startSpinner() {
    yield delay(300);
    yield put(startFormSpinner());
}

function* authStart(action: IAuthStartAction) {
    const { username, password } = action.payload;
    const spinner = yield fork(startSpinner);
    try {
        const { response, timeout } = yield race({
            response: call(login, username, password),
            timeout: delay(10000),
        });

        yield cancel(spinner);

        if (timeout) {
            yield put(authFail("Timeout"));
            return;
        }
        if (response.data) {
            const user = response.data;
            yield put(authSuccess(user));
        } else {
            yield put(authFail(response.error));
        }
    } catch (e) {
        yield cancel(spinner);
        yield put(authFail("Internal error"));
    }
}

function* signupStart(action: ISignupStartAction) {
    const { username, password, email } = action.payload;
    const spinner = yield fork(startSpinner);
    try {
        const { response, timeout } = yield race({
            response: call(signup, username, password, email),
            timeout: delay(10000),
        });

        yield cancel(spinner);

        if (timeout) {
            yield put(authFail("Timeout"));
            return;
        }
        if (response.data) {
            const user = response.data;
            yield put(authSuccess(user));
        } else {
            yield put(authFail(response.error));
        }
    } catch (e) {
        yield cancel(spinner);
        yield put(authFail(e.toString()));
    }
}

export function* authSaga() {
    yield all([
        takeLatest(AuthTypes.AUTH_START, authStart),
        takeLatest(AuthTypes.SIGNUP_START, signupStart),
    ]);
}
