import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
  increment,
  type Unsubscribe,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string | null;
  country: string;
  xp: number;
  streak: number;
  predictionAccuracy: number;
  isPro: boolean;
  createdAt: number;
}

export async function createOrUpdateUserProfile(user: User, country = "MEX"): Promise<void> {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const profile: UserProfile = {
      uid: user.uid,
      displayName: user.displayName ?? "FootballFan",
      email: user.email,
      country,
      xp: 0,
      streak: 0,
      predictionAccuracy: 0,
      isPro: false,
      createdAt: Date.now(),
    };
    await setDoc(ref, profile);
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function updateUserCountry(uid: string, country: string): Promise<void> {
  await updateDoc(doc(db, "users", uid), { country });
}

export async function addXp(uid: string, amount: number): Promise<void> {
  await updateDoc(doc(db, "users", uid), { xp: increment(amount) });
}

export interface RoomMessage {
  id: string;
  uid: string;
  displayName: string;
  text: string;
  createdAt: number;
}

export function subscribeToRoom(
  roomId: string,
  onMessages: (msgs: RoomMessage[]) => void
): Unsubscribe {
  const q = query(
    collection(db, "rooms", roomId, "messages"),
    orderBy("createdAt", "desc"),
    limit(30)
  );
  return onSnapshot(q, (snap) => {
    const msgs: RoomMessage[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<RoomMessage, "id">),
    }));
    onMessages(msgs);
  });
}

export async function sendRoomMessage(
  roomId: string,
  uid: string,
  displayName: string,
  text: string
): Promise<void> {
  await addDoc(collection(db, "rooms", roomId, "messages"), {
    uid,
    displayName,
    text,
    createdAt: serverTimestamp(),
  });
}

export interface RoomPresence {
  activeCount: number;
}

export function subscribeToRoomPresence(
  roomId: string,
  onPresence: (p: RoomPresence) => void
): Unsubscribe {
  return onSnapshot(doc(db, "rooms", roomId), (snap) => {
    if (snap.exists()) {
      onPresence({ activeCount: snap.data().activeCount ?? 0 });
    }
  });
}

export async function joinRoom(roomId: string, uid: string): Promise<void> {
  await updateDoc(doc(db, "rooms", roomId), { activeCount: increment(1) }).catch(() => {
    setDoc(doc(db, "rooms", roomId), { activeCount: 1 }, { merge: true });
  });
}

export async function leaveRoom(roomId: string, uid: string): Promise<void> {
  await updateDoc(doc(db, "rooms", roomId), { activeCount: increment(-1) }).catch(() => {});
}

export const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  await createOrUpdateUserProfile(result.user);
  return result.user;
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await createOrUpdateUserProfile(result.user);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export { onAuthStateChanged };
