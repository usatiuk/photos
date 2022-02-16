import { all, call, delay, put, race, takeLatest } from "redux-saga/effects";
import { changeUserPassword, fetchUser } from "../../redux/api/user";

import {
    getUserFail,
    getUserSuccess,
    IUserPassChangeAction,
    userPassChangeFail,
    userPassChangeSuccess,
    UserTypes,
} from "./actions";

function* getUser() {
    try {
        const { response, timeout } = yield race({
            response: call(fetchUser),
            timeout: delay(10000),
        });

        if (timeout) {
            yield put(getUserFail("Timeout", false));
            return;
        }
        if (response.data) {
            const user = response.data;
            yield put(getUserSuccess(user));
        } else {
            yield put(getUserFail(response.error, true));
        }
    } catch (e) {
        yield put(getUserFail("Internal error", false));
    }
}

function* userPassChange(action: IUserPassChangeAction) {
    try {
        const { response, timeout } = yield race({
            response: call(changeUserPassword, action.password),
            timeout: delay(10000),
        });

        if (timeout) {
            yield put(userPassChangeFail("Timeout", false));
            return;
        }
        if (response.data) {
            const user = response.data;
            yield put(userPassChangeSuccess(user));
        } else {
            yield put(userPassChangeFail(response.error, true));
        }
    } catch (e) {
        yield put(userPassChangeFail("Internal error", false));
    }
}

export function* userSaga() {
    yield all([
        takeLatest(UserTypes.USER_GET, getUser),
        takeLatest(UserTypes.USER_PASS_CHANGE, userPassChange),
    ]);
}
