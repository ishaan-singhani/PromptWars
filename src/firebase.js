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
import DOMPurify from "dompurify";

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
  } catch (error) {
    console.warn("MindBoard: Failed to initialize Firebase. Falling back to local storage mock mode.", error);
    useMock = true;
  }
}

// Client-side sliding-window rate limiter for mood check-ins (max 3 per minute)
const moodSubmissionTimestamps = {};

/**
 * Checks if a user is currently rate-limited for mood submissions.
 * @param {string} uid - The unique user ID.
 * @returns {boolean} True if the user is rate-limited, false otherwise.
 */
function isRateLimited(uid) {
  const now = Date.now();
  if (!moodSubmissionTimestamps[uid]) {
    moodSubmissionTimestamps[uid] = [];
  }
  // Remove timestamps older than 60 seconds (1 minute)
  moodSubmissionTimestamps[uid] = moodSubmissionTimestamps[uid].filter(
    (timestamp) => now - timestamp < 60000
  );
  if (moodSubmissionTimestamps[uid].length >= 3) {
    return true;
  }
  moodSubmissionTimestamps[uid].push(now);
  return false;
}

/**
 * Helper: Format date as YYYY-MM-DD
 * @param {Date} [date=new Date()] - The date object to format.
 * @returns {string} The formatted date string (YYYY-MM-DD).
 */
export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// ----------------------------------------------------
// LOCAL STORAGE MOCK DB IMPLEMENTATION
// ----------------------------------------------------
const mockDb = {
  /**
   * Logs in a student anonymously (Mock mode).
   * @returns {Promise<{uid: string}>} The user credentials object.
   */
  async loginAnonymously() {
    let mockUid = localStorage.getItem("mindboard_mock_uid");
    if (!mockUid) {
      mockUid = "mock_user_" + Math.random().toString(36).substring(2, 9);
      localStorage.setItem("mindboard_mock_uid", mockUid);
    }
    return { uid: mockUid };
  },

  /**
   * Fetches onboarding data for a user (Mock mode).
   * @param {string} uid - The user ID.
   * @returns {Promise<object|null>} The onboarding data or null.
   */
  async getOnboarding(uid) {
    const data = localStorage.getItem(`mindboard_onboarding_${uid}`);
    return data ? JSON.parse(data) : null;
  },

  /**
   * Saves onboarding data for a user (Mock mode).
   * @param {string} uid - The user ID.
   * @param {object} data - The onboarding data to save.
   * @returns {Promise<object>} The saved onboarding data.
   */
  async saveOnboarding(uid, data) {
    localStorage.setItem(`mindboard_onboarding_${uid}`, JSON.stringify(data));
    const streakKey = `mindboard_streak_${uid}`;
    if (!localStorage.getItem(streakKey)) {
      localStorage.setItem(streakKey, JSON.stringify({
        currentStreak: 0,
        lastCheckInDate: null
      }));
    }
    return data;
  },

  /**
   * Saves a mood check-in (Mock mode).
   * @param {string} uid - The user ID.
   * @param {string} mood - The logged mood.
   * @param {string} trigger - The stress trigger.
   * @returns {Promise<{entry: object, streak: object}>} The created entry and updated streak.
   */
  async saveCheckIn(uid, mood, trigger) {
    const historyKey = `mindboard_history_${uid}`;
    const streakKey = `mindboard_streak_${uid}`;
    
    const history = JSON.parse(localStorage.getItem(historyKey) || "[]");
    const newEntry = {
      id: "entry_" + Date.now(),
      mood,
      trigger,
      timestamp: new Date().toISOString()
    };
    history.push(newEntry);
    localStorage.setItem(historyKey, JSON.stringify(history));

    const streakData = JSON.parse(localStorage.getItem(streakKey) || '{"currentStreak":0,"lastCheckInDate":null}');
    const todayStr = getLocalDateString();
    
    let currentStreak = streakData.currentStreak || 0;
    const lastCheckIn = streakData.lastCheckInDate;
    
    if (lastCheckIn !== todayStr) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = getLocalDateString(yesterday);
      
      if (lastCheckIn === yesterdayStr) {
        currentStreak += 1;
      } else {
        currentStreak = 1;
      }
      streakData.currentStreak = currentStreak;
      streakData.lastCheckInDate = todayStr;
      localStorage.setItem(streakKey, JSON.stringify(streakData));
    }

    return { entry: newEntry, streak: streakData };
  },

  /**
   * Retrieves mood check-in history (Mock mode).
   * @param {string} uid - The user ID.
   * @returns {Promise<array>} Array of check-in entries.
   */
  async getCheckInHistory(uid) {
    const historyKey = `mindboard_history_${uid}`;
    return JSON.parse(localStorage.getItem(historyKey) || "[]");
  },

  /**
   * Retrieves current check-in streak data (Mock mode).
   * @param {string} uid - The user ID.
   * @returns {Promise<object>} The streak metrics object.
   */
  async getStreak(uid) {
    const streakKey = `mindboard_streak_${uid}`;
    const streakData = JSON.parse(localStorage.getItem(streakKey) || '{"currentStreak":0,"lastCheckInDate":null}');
    
    const todayStr = getLocalDateString();
    const lastCheckIn = streakData.lastCheckInDate;
    
    if (lastCheckIn) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = getLocalDateString(yesterday);
      
      if (lastCheckIn !== todayStr && lastCheckIn !== yesterdayStr) {
        streakData.currentStreak = 0;
        localStorage.setItem(streakKey, JSON.stringify(streakData));
      }
    }
    
    return streakData;
  },

  /**
   * Saves a private digital journal entry (Mock mode).
   * @param {string} uid - The user ID.
   * @param {string} text - The journal text entry.
   * @returns {Promise<object>} The saved journal entry record.
   */
  async saveJournalEntry(uid, text) {
    const journalKey = `mindboard_journal_${uid}`;
    const journals = JSON.parse(localStorage.getItem(journalKey) || "[]");
    const newJournal = {
      id: "journal_" + Date.now(),
      text,
      timestamp: new Date().toISOString()
    };
    journals.unshift(newJournal);
    localStorage.setItem(journalKey, JSON.stringify(journals));
    return newJournal;
  },

  /**
   * Fetches all journal entries for a user (Mock mode).
   * @param {string} uid - The user ID.
   * @returns {Promise<array>} Array of journal entry records.
   */
  async getJournalEntries(uid) {
    const journalKey = `mindboard_journal_${uid}`;
    return JSON.parse(localStorage.getItem(journalKey) || "[]");
  }
};

// ----------------------------------------------------
// FIREBASE LIVE IMPLEMENTATION
// ----------------------------------------------------
const firebaseDb = {
  /**
   * Logs in a student anonymously.
   * @returns {Promise<{uid: string}>} The user credentials object.
   */
  async loginAnonymously() {
    const userCredential = await signInAnonymously(auth);
    return { uid: userCredential.user.uid };
  },

  /**
   * Fetches onboarding data for a user.
   * @param {string} uid - The user ID.
   * @returns {Promise<object|null>} The onboarding data or null.
   */
  async getOnboarding(uid) {
    const docRef = doc(db, "students", uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  },

  /**
   * Saves onboarding data for a user.
   * @param {string} uid - The user ID.
   * @param {object} data - The onboarding data.
   * @returns {Promise<object>} The onboarding data.
   */
  async saveOnboarding(uid, data) {
    const docRef = doc(db, "students", uid);
    await setDoc(docRef, {
      ...data,
      createdAt: serverTimestamp()
    }, { merge: true });

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

  /**
   * Saves a mood check-in.
   * @param {string} uid - The user ID.
   * @param {string} mood - The logged mood.
   * @param {string} trigger - The stress trigger.
   * @returns {Promise<{entry: object, streak: object}>} The created entry and updated streak.
   */
  async saveCheckIn(uid, mood, trigger) {
    const checkInRef = collection(db, "students", uid, "checkins");
    const newDoc = await addDoc(checkInRef, {
      mood,
      trigger,
      timestamp: serverTimestamp()
    });

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

    if (lastCheckIn !== todayStr) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = getLocalDateString(yesterday);

      if (lastCheckIn === yesterdayStr) {
        currentStreak += 1;
      } else {
        currentStreak = 1;
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

  /**
   * Retrieves mood check-in history.
   * @param {string} uid - The user ID.
   * @returns {Promise<array>} Array of check-in entries.
   */
  async getCheckInHistory(uid) {
    const checkInRef = collection(db, "students", uid, "checkins");
    const q = query(checkInRef, orderBy("timestamp", "desc"), limit(50));
    const querySnapshot = await getDocs(q);
    const history = [];
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
      history.push({
        id: doc.id,
        mood: data.mood,
        trigger: data.trigger,
        timestamp: dateString
      });
    });
    return history.reverse();
  },

  /**
   * Retrieves current check-in streak data.
   * @param {string} uid - The user ID.
   * @returns {Promise<object>} The streak metrics object.
   */
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
          streakData.currentStreak = 0;
          await setDoc(streakRef, { currentStreak: 0 }, { merge: true });
        }
      }
    }
    return streakData;
  },

  /**
   * Saves a private journal entry.
   * @param {string} uid - The user ID.
   * @param {string} text - The journal text entry.
   * @returns {Promise<object>} The saved journal entry record.
   */
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

  /**
   * Fetches all journal entries for a user.
   * @param {string} uid - The user ID.
   * @returns {Promise<array>} Array of journal entry records.
   */
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

/**
 * Checks if the application is running in mock database mode.
 * @returns {boolean} True if using mock local storage database, false otherwise.
 */
export const isUsingMock = () => useMock;

/**
 * Retrieves the live Firebase Auth instance.
 * @returns {object|null} The FirebaseAuth instance.
 */
export const getFirebaseAuth = () => auth;

/**
 * Logs in a student anonymously.
 * @returns {Promise<object>} User credential record containing unique session ID.
 */
export async function loginStudent() {
  if (useMock) return mockDb.loginAnonymously();
  return firebaseDb.loginAnonymously();
}

/**
 * Retrieves the student profile details.
 * @param {string} uid - Unique user session ID.
 * @returns {Promise<object|null>} Profile details or null if onboarding is not complete.
 */
export async function fetchOnboarding(uid) {
  if (useMock) return mockDb.getOnboarding(uid);
  return firebaseDb.getOnboarding(uid);
}

/**
 * Saves or updates onboarding profile details.
 * Sanitizes input text using DOMPurify before database persistence.
 * @param {string} uid - Unique user session ID.
 * @param {object} data - Profile fields { name, targetExam, examDate }.
 * @returns {Promise<object>} The saved user profile details.
 */
export async function saveOnboarding(uid, data) {
  const sanitizedData = { ...data };
  if (sanitizedData.name) {
    sanitizedData.name = DOMPurify.sanitize(sanitizedData.name);
  }
  if (useMock) return mockDb.saveOnboarding(uid, sanitizedData);
  return firebaseDb.saveOnboarding(uid, sanitizedData);
}

/**
 * Submits a daily mood and stress check-in.
 * Enforces rate limiting of maximum 3 check-in submissions per minute per user.
 * @param {string} uid - Unique user session ID.
 * @param {string} mood - Selected mood category.
 * @param {string} trigger - Associated stress trigger factor.
 * @returns {Promise<object>} Result containing the created entry log and updated streak metrics.
 * @throws {Error} Rate limit exceeded errors.
 */
export async function saveMoodCheckIn(uid, mood, trigger) {
  if (isRateLimited(uid)) {
    throw new Error("Rate limit exceeded. You can only submit 3 mood check-ins per minute.");
  }
  if (useMock) return mockDb.saveCheckIn(uid, mood, trigger);
  return firebaseDb.saveCheckIn(uid, mood, trigger);
}

/**
 * Retrieves list of past mood logs for analytics.
 * @param {string} uid - Unique user session ID.
 * @returns {Promise<array>} Sorted chronological array of mood logs.
 */
export async function getMoodHistory(uid) {
  if (useMock) return mockDb.getCheckInHistory(uid);
  return firebaseDb.getCheckInHistory(uid);
}

/**
 * Retrieves current daily check-in streak metrics.
 * @param {string} uid - Unique user session ID.
 * @returns {Promise<object>} Current streak count and last log date object.
 */
export async function getStreak(uid) {
  if (useMock) return mockDb.getStreak(uid);
  return firebaseDb.getStreak(uid);
}

/**
 * Saves a private digital journal entry.
 * Sanitizes input text using DOMPurify before database persistence.
 * @param {string} uid - Unique user session ID.
 * @param {string} text - Raw input text entry.
 * @returns {Promise<object>} Created journal entry details.
 */
export async function saveJournalEntry(uid, text) {
  const sanitizedText = DOMPurify.sanitize(text);
  if (useMock) return mockDb.saveJournalEntry(uid, sanitizedText);
  return firebaseDb.saveJournalEntry(uid, sanitizedText);
}

/**
 * Retrieves list of user's past journal entries.
 * @param {string} uid - Unique user session ID.
 * @returns {Promise<array>} Array of private journal entries.
 */
export async function getJournalEntries(uid) {
  if (useMock) return mockDb.getJournalEntries(uid);
  return firebaseDb.getJournalEntries(uid);
}

/**
 * Listens for anonymous login state updates.
 * @param {function} callback - Callback function triggered on user authentication change.
 * @returns {function} Cleanup function to unsubscribe listener.
 */
export function onAuthStateChangedListener(callback) {
  if (useMock) {
    mockDb.loginAnonymously().then(user => callback(user));
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}
