import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBGKErv2eB0PprGXrJRIaH0oIyAwBorp90',
  authDomain: 'co-found-chat.firebaseapp.com',
  projectId: 'co-found-chat',
  storageBucket: 'co-found-chat.firebasestorage.app',
  messagingSenderId: '924782246243',
  appId: '1:924782246243:web:85a06104ada8abdf37fb56',
  measurementId: 'G-L97Y1REL1X',
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export default app
