import api from './api'

export async function submitVerification(payload)
{
    const res = await api.post('/verification', payload)
    return res
}

export async function getVerificationStatus()
{
    const res = await api.get('/verification')
    return res
}

export default { submitVerification, getVerificationStatus }