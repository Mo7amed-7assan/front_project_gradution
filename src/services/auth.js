import api from './api'

const getResponseData = (res) => res?.data || {}

export async function authLogin(email, password)
{
    const res = await api.post('/auth/login', { email, password })
    return getResponseData(res)
}

export async function authRegister({ email, username, password, password_confirmation, full_name })
{
    const res = await api.post('/auth/register', {
        email,
        username,
        password,
        password_confirmation,
        full_name
    })
    return getResponseData(res)
}

export async function authGuest()
{
    const res = await api.post('/auth/guest')
    return getResponseData(res)
}

export async function authEmailVerify(token)
{
    const res = await api.get(`/auth/email/verify/${token}`)
    return getResponseData(res)
}

export async function authPasswordForgot(email)
{
    const res = await api.post('/auth/password/forgot', { email })
    return getResponseData(res)
}

export async function authPasswordReset(token, password, password_confirmation)
{
    const res = await api.post('/auth/password/reset', {
        token,
        password,
        password_confirmation
    })
    return getResponseData(res)
}

export function getAccessToken(responseData)
{
    return responseData?.data?.access_token || responseData?.access_token || null
}

export function getAuthUser(responseData)
{
    return responseData?.data?.user || responseData?.user || responseData?.data || null
}

export default {
    authLogin,
    authRegister,
    authGuest,
    authEmailVerify,
    authPasswordForgot,
    authPasswordReset,
    getAccessToken,
    getAuthUser
}
