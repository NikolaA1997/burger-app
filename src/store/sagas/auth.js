import { put, delay, call } from 'redux-saga/effects'
import * as actions from '../actions/index'
import axios from 'axios'

export function* logoutSaga(action) {
    yield call([localStorage, 'removeItem'], "token")
    yield call([localStorage, 'removeItem'], "expirationDate")
    yield call([localStorage, 'removeItem'], "userId")
    yield put(actions.logoutSucceed())
}

export function* checkAuthTimeoutSaga(action) {
    yield delay(action.expirationTime * 1000)
    yield put(actions.logout())
}

export function* authUserSaga(action) {
    yield put(actions.authStart());
    const authData = {
        email: action.email,
        password: action.password,
        returnSecureToken: true
    }
    let url = 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBO_u4gCreGdpeYOGjtso8SVgW_p43Spb4'
    if (!action.isSignup) {
        url = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyBO_u4gCreGdpeYOGjtso8SVgW_p43Spb4'
    }
    try {
        const res = yield axios.post(url, authData)
        const expirationDate = yield new Date(new Date().getTime() + res.data.expiresIn * 1000)
        yield localStorage.setItem('token', res.data.idToken)
        yield localStorage.setItem('expirationDate', expirationDate)
        yield localStorage.setItem('userId', res.data.localId)
        yield put(actions.authSuccess(res.data.idToken, res.data.localId))
        yield put(actions.checkAuthTimeout(res.data.expiresIn))
    } catch (err) {
        yield put(actions.authFail(err.response.data.error))
    }
}

export function* authCheckStateSaga(action) {
    const token = yield localStorage.getItem('token')
    if (!token) {
        yield put(actions.logout())
    } else {
        const expirationDate = yield new Date(localStorage.getItem('expirationDate'))
        if (expirationDate > new Date()) {
            const userId = localStorage.getItem('userId')
            yield put(actions.authSuccess(token, userId))
            yield put(actions.checkAuthTimeout((expirationDate.getTime() - new Date().getTime()) / 1000))
        } else {
            yield put(actions.logout())
        }
    }
}