import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  databaseURL: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
  measurementId: '',
}

const app = initializeApp(firebaseConfig)

export const db = getDatabase(app)
export const analyticsPromise =
  typeof window !== 'undefined' ? isSupported().then((supported) => supported ? getAnalytics(app) : null) : Promise.resolve(null)

export default app
