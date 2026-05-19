import api from './api'

const getData = (res) => res?.data?.data ?? res?.data ?? res

export async function submitVerification(payload)
{
    const res = await api.post('/verification', payload)
    return getData(res)
}

export async function getVerificationStatus()
{
    const res = await api.get('/verification')
    return getData(res)
}

export default { submitVerification, getVerificationStatus }
