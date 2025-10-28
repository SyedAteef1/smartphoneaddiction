// Firebase Cloud Database Setup
// Install: npm install firebase

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, where, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const saveUsageToCloud = async (userId: string, appName: string, duration: number) => {
  try {
    await addDoc(collection(db, 'usage_logs'), {
      userId,
      appName,
      duration,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error saving to Firebase:', error);
  }
};

export const getUserUsage = async (userId: string) => {
  const q = query(collection(db, 'usage_logs'), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data());
};

export const firebase = { saveUsageToCloud, getUserUsage };
