import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: 'AIzaSyCfG0JLcFns0Ntky17jE6HNdKutMDxuFKw',
  authDomain: 'co-found-28b0b.firebaseapp.com',
  databaseURL: 'https://co-found-28b0b-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'co-found-28b0b',
  storageBucket: 'co-found-28b0b.firebasestorage.app',
  messagingSenderId: '313351495022',
  appId: '1:313351495022:web:92ae336c08885cd6a3f57f',
  measurementId: 'G-K7RVJM6B34',
}

const app = initializeApp(firebaseConfig)

export const db = getDatabase(app)
export const analyticsPromise =
  typeof window !== 'undefined' ? isSupported().then((supported) => supported ? getAnalytics(app) : null) : Promise.resolve(null)

export default app
