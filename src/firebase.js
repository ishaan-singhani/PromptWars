import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  addDoc, 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  serverTimestamp,
  Timestamp
} from "firebase/firestore";

// Read variables from import.meta.env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Determine if Firebase config is fully present
const isFirebaseConfigured = 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "your_firebase_api_key" &&
  firebaseConfig.projectId;

let app;
let auth;
let db;
let useMock = !isFirebaseConfigured;

if (!useMock) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("MindBoard: Connected to Firebase successfully.");
  } catch (error) {
    console.warn("MindBoard: Failed to initialize Firebase. Falling back to local storage mock mode.", error);
    useMock = true;
  }
} else {
  console.log("MindBoard: Firebase config not found. Running in local storage mock mode.");
}

// Helper: Format date as YYYY-MM-DD
function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// ----------------------------------------------------
// LOCAL STORAGE MOCK DB IMPLEMENTATION
// ----------------------------------------------------
const mockDb = {
  async loginAnonymously() {
    let mockUid = localStorage.getItem("mindboard_mock_uid");
    if (!mockUid) {
      mockUid = "mock_user_" + Math.random().toString(36).substring(2, 9);
      localStorage.setItem("mindboard_mock_uid", mockUid);
    }
    return { uid: mockUid };
  },

  async getOnboarding(uid) {
    const data = localStorage.getItem(`mindboard_onboarding_${uid}`);
    return data ? JSON.parse(data) : null;
  },

  async saveOnboarding(uid, data) {
    localStorage.setItem(`mindboard_onboarding_${uid}`, JSON.stringify(data));
    // Initialize empty streak for new user
    const streakKey = `mindboard_streak_${uid}`;
    if (!localStorage.getItem(streakKey)) {
      localStorage.setItem(streakKey, JSON.stringify({
        currentStreak: 0,
        lastCheckInDate: null
      }));
    }
    return data;
  },

  async saveCheckIn(uid, mood, trigger) {
    const historyKey = `mindboard_history_${uid}`;
    const streakKey = `mindboard_streak_${uid}`;
    
    // 1. Save Mood Entry
    const history = JSON.parse(localStorage.getItem(historyKey) || "[]");
    const newEntry = {
      id: "entry_" + Date.now(),
      mood,
      trigger,
      timestamp: new Date().toISOString()
    };
    history.push(newEntry);
    localStorage.setItem(historyKey, JSON.stringify(history));

    // 2. Update Streak
    const streakData = JSON.parse(localStorage.getItem(streakKey) || '{"currentStreak":0,"lastCheckInDate":null}');
    const todayStr = getLocalDateString();
    
    let currentStreak = streakData.currentStreak || 0;
    const lastCheckIn = streakData.lastCheckInDate; // YYYY-MM-DD
    
    if (lastCheckIn === todayStr) {
      // Already checked in today, streak stays the same
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = getLocalDateString(yesterday);
      
      if (lastCheckIn === yesterdayStr) {
        currentStreak += 1;
      } else {
        // Streak broken
        currentStreak = 1;
      }
      streakData.currentStreak = currentStreak;
      streakData.lastCheckInDate = todayStr;
      localStorage.setItem(streakKey, JSON.stringify(streakData));
    }

    return { entry: newEntry, streak: streakData };
  },

  async getCheckInHistory(uid) {
    const historyKey = `mindboard_history_${uid}`;
    return JSON.parse(localStorage.getItem(historyKey) || "[]");
  },

  async getStreak(uid) {
    const streakKey = `mindboard_streak_${uid}`;
    const streakData = JSON.parse(localStorage.getItem(streakKey) || '{"currentStreak":0,"lastCheckInDate":null}');
    
    // Check if streak was broken (i.e. last checkin was before yesterday)
    const todayStr = getLocalDateString();
    const lastCheckIn = streakData.lastCheckInDate;
    
    if (lastCheckIn) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = getLocalDateString(yesterday);
      
      if (lastCheckIn !== todayStr && lastCheckIn !== yesterdayStr) {
        // Streak is broken
        streakData.currentStreak = 0;
        localStorage.setItem(streakKey, JSON.stringify(streakData));
      }
    }
    
    return streakData;
  },

  async saveJournalEntry(uid, text) {
    const journalKey = `mindboard_journal_${uid}`;
    const journals = JSON.parse(localStorage.getItem(journalKey) || "[]");
    const newJournal = {
      id: "journal_" + Date.now(),
      text,
      timestamp: new Date().toISOString()
    };
    journals.unshift(newJournal); // Add to beginning (latest first)
    localStorage.setItem(journalKey, JSON.stringify(journals));
    return newJournal;
  },

  async getJournalEntries(uid) {
    const journalKey = `mindboard_journal_${uid}`;
    return JSON.parse(localStorage.getItem(journalKey) || "[]");
  }
};

// ----------------------------------------------------
// FIREBASE LIVE IMPLEMENTATION
// ----------------------------------------------------
const firebaseDb = {
  async loginAnonymously() {
    const userCredential = await signInAnonymously(auth);
    return { uid: userCredential.user.uid };
  },

  async getOnboarding(uid) {
    const docRef = doc(db, "students", uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  },

  async saveOnboarding(uid, data) {
    const docRef = doc(db, "students", uid);
    await setDoc(docRef, {
      ...data,
      createdAt: serverTimestamp()
    }, { merge: true });

    // Initialize streak if not exists
    const streakRef = doc(db, "streaks", uid);
    const streakSnap = await getDoc(streakRef);
    if (!streakSnap.exists()) {
      await setDoc(streakRef, {
        currentStreak: 0,
        lastCheckInDate: null
      });
    }
    return data;
  },

  async saveCheckIn(uid, mood, trigger) {
    // 1. Save check-in log
    const checkInRef = collection(db, "students", uid, "checkins");
    const newDoc = await addDoc(checkInRef, {
      mood,
      trigger,
      timestamp: serverTimestamp()
    });

    // 2. Calculate and update streak
    const streakRef = doc(db, "streaks", uid);
    const streakSnap = await getDoc(streakRef);
    let currentStreak = 0;
    let lastCheckIn = null;

    if (streakSnap.exists()) {
      const data = streakSnap.data();
      currentStreak = data.currentStreak || 0;
      lastCheckIn = data.lastCheckInDate;
    }

    const todayStr = getLocalDateString();

    if (lastCheckIn === todayStr) {
      // Already checked in today, keep streak
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = getLocalDateString(yesterday);

      if (lastCheckIn === yesterdayStr) {
        currentStreak += 1;
      } else {
        currentStreak = 1; // broken or new streak
      }
      lastCheckIn = todayStr;
      await setDoc(streakRef, {
        currentStreak,
        lastCheckInDate: lastCheckIn
      }, { merge: true });
    }

    return { 
      entry: { id: newDoc.id, mood, trigger, timestamp: new Date().toISOString() },
      streak: { currentStreak, lastCheckInDate: lastCheckIn }
    };
  },

  async getCheckInHistory(uid) {
    const checkInRef = collection(db, "students", uid, "checkins");
    const q = query(checkInRef, orderBy("timestamp", "desc"), limit(50));
    const querySnapshot = await getDocs(q);
    const history = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Safely convert Timestamp to ISO string
      let dateString;
      if (data.timestamp instanceof Timestamp) {
        dateString = data.timestamp.toDate().toISOString();
      } else if (data.timestamp && data.timestamp.seconds) {
        dateString = new Date(data.timestamp.seconds * 1000).toISOString();
      } else {
        dateString = new Date().toISOString();
      }
      history.push({
        id: doc.id,
        mood: data.mood,
        trigger: data.trigger,
        timestamp: dateString
      });
    });
    // Return sorted chronologically for ease of graphing
    return history.reverse();
  },

  async getStreak(uid) {
    const streakRef = doc(db, "streaks", uid);
    const streakSnap = await getDoc(streakRef);
    let streakData = { currentStreak: 0, lastCheckInDate: null };

    if (streakSnap.exists()) {
      streakData = streakSnap.data();
      
      const todayStr = getLocalDateString();
      const lastCheckIn = streakData.lastCheckInDate;

      if (lastCheckIn) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = getLocalDateString(yesterday);

        if (lastCheckIn !== todayStr && lastCheckIn !== yesterdayStr) {
          // Reset streak as it was broken
          streakData.currentStreak = 0;
          await setDoc(streakRef, { currentStreak: 0 }, { merge: true });
        }
      }
    }
    return streakData;
  },

  async saveJournalEntry(uid, text) {
    const journalRef = collection(db, "students", uid, "journals");
    const docRef = await addDoc(journalRef, {
      text,
      timestamp: serverTimestamp()
    });
    return {
      id: docRef.id,
      text,
      timestamp: new Date().toISOString()
    };
  },

  async getJournalEntries(uid) {
    const journalRef = collection(db, "students", uid, "journals");
    const q = query(journalRef, orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    const entries = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      let dateString;
      if (data.timestamp instanceof Timestamp) {
        dateString = data.timestamp.toDate().toISOString();
      } else if (data.timestamp && data.timestamp.seconds) {
        dateString = new Date(data.timestamp.seconds * 1000).toISOString();
      } else {
        dateString = new Date().toISOString();
      }
      entries.push({
        id: doc.id,
        text: data.text,
        timestamp: dateString
      });
    });
    return entries;
  }
};

// ----------------------------------------------------
// EXPORT UNIFIED DATABASE INTERFACE
// ----------------------------------------------------
export const isUsingMock = () => useMock;
export const getFirebaseAuth = () => auth;

export async function loginStudent() {
  if (useMock) return mockDb.loginAnonymously();
  return firebaseDb.loginAnonymously();
}

export async function fetchOnboarding(uid) {
  if (useMock) return mockDb.getOnboarding(uid);
  return firebaseDb.getOnboarding(uid);
}

export async function saveOnboarding(uid, data) {
  if (useMock) return mockDb.saveOnboarding(uid, data);
  return firebaseDb.saveOnboarding(uid, data);
}

export async function saveMoodCheckIn(uid, mood, trigger) {
  if (useMock) return mockDb.saveCheckIn(uid, mood, trigger);
  return firebaseDb.saveCheckIn(uid, mood, trigger);
}

export async function getMoodHistory(uid) {
  if (useMock) return mockDb.getCheckInHistory(uid);
  return firebaseDb.getCheckInHistory(uid);
}

export async function getStreak(uid) {
  if (useMock) return mockDb.getStreak(uid);
  return firebaseDb.getStreak(uid);
}

export async function saveJournalEntry(uid, text) {
  if (useMock) return mockDb.saveJournalEntry(uid, text);
  return firebaseDb.saveJournalEntry(uid, text);
}

export async function getJournalEntries(uid) {
  if (useMock) return mockDb.getJournalEntries(uid);
  return firebaseDb.getJournalEntries(uid);
}

// Auth State Change listener for React hooks
export function onAuthStateChangedListener(callback) {
  if (useMock) {
    // Return a unsubscribe dummy, and trigger listener with mock user
    mockDb.loginAnonymously().then(user => callback(user));
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}
