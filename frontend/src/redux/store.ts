import { applyMiddleware, createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import { persistStore } from "redux-persist";
import createSagaMiddlware from "redux-saga";
import { rootReducer } from "~redux/reducers";

import { setToken } from "./api/utils";
import { authSaga } from "./auth/sagas";
import { photosSaga } from "./photos/sagas";
import { getUser } from "./user/actions";
import { userSaga } from "./user/sagas";

const sagaMiddleware = createSagaMiddlware();

export const store = createStore(
    rootReducer,
    composeWithDevTools(applyMiddleware(sagaMiddleware)),
);

export const persistor = persistStore(store, null, () => {
    const state = store.getState();
    if (state.auth.jwt) {
        setToken(state.auth.jwt);
        store.dispatch(getUser());
    }
});

sagaMiddleware.run(authSaga);
sagaMiddleware.run(userSaga);
sagaMiddleware.run(photosSaga);
