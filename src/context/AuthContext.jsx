import React, { createContext, useContext, useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import api from '../services/api'
import { authLogin, authRegister, authGuest, authEmailVerify, authPasswordForgot, authPasswordReset, getAccessToken, getAuthUser } from '../services/auth'

const AuthContext = createContext(null)

const normalizeUser = (value) => {
  const user = value?.user || value
  if (!user) return null
  const id = user.id || user.user_id || user.data?.id
  return { ...user, id }
}

export function AuthProvider({ children }){
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchMe = async () => {
    const token = Cookies.get('cf_token')
    if (!token) {
      setLoading(false)
      return
    }
    try {
      // Use /profile to hydrate user state when token exists
      const res = await api.get('/profile')
      // Try to resolve common shapes: { data: { user: {...} } } or { data: {...} }
      const u = res?.data?.data?.user || res?.data?.data || res?.data?.user || res?.data
      setUser(normalizeUser(u))
    } catch (err) {
      Cookies.remove('cf_token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{
    fetchMe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = async (email, password) => {
    const res = await authLogin(email, password)
    const token = getAccessToken(res)
    const userObj = getAuthUser(res)
    if (!token) throw new Error('No token returned from API')
    Cookies.set('cf_token', token, { secure: true, sameSite: 'lax' })
    setUser(normalizeUser(userObj))
    return res
  }

  const register = async (payload) => {
    const res = await authRegister(payload)
    const token = getAccessToken(res)
    const userObj = getAuthUser(res)
    if (token) Cookies.set('cf_token', token, { secure: true, sameSite: 'lax' })
    setUser(normalizeUser(userObj))
    return res
  }

  const guest = async () => {
    const res = await authGuest()
    const token = getAccessToken(res)
    const userObj = getAuthUser(res)
    if (!token) throw new Error('No token returned from API')
    Cookies.set('cf_token', token, { secure: true, sameSite: 'lax' })
    setUser(normalizeUser(userObj))
    return res
  }

  const passwordForgot = async (email) => {
    const res = await authPasswordForgot(email)
    return res
  }

  const emailVerify = async (token) => {
    const res = await authEmailVerify(token)
    return res
  }

  const passwordReset = async (token, password, password_confirmation) => {
    const res = await authPasswordReset(token, password, password_confirmation)
    return res
  }

  const logout = () => {
    Cookies.remove('cf_token')
    setUser(null)
    try { window.location.href = '/login' } catch (e) {}
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, fetchMe, guest, emailVerify, passwordForgot, passwordReset }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
