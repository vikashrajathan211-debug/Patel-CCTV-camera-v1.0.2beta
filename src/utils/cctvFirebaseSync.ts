import { getDatabase, ref, set, push, onValue, DatabaseReference } from 'firebase/database';
import { getFirebaseApp, isFirebaseConfigured } from '../firebase';

export interface CCTVItemData {
  itemId?: string;
  name: string;
  priceOrStatus: string;
  category?: string;
  price?: number;
  inStock?: boolean;
  updatedAt?: number;
}

/**
 * Returns the Firebase Realtime Database reference for "CCTV_Items"
 */
export function getCCTVItemsDbRef(): DatabaseReference | null {
  const app = getFirebaseApp();
  if (!app || !isFirebaseConfigured()) {
    return null;
  }
  const db = getDatabase(app);
  return ref(db, 'CCTV_Items');
}

/**
 * Uploads a new CCTV Item to "CCTV_Items" node in Firebase.
 * Generates a unique key using push().
 */
export async function uploadCCTVItem(item: Omit<CCTVItemData, 'itemId'>): Promise<string | null> {
  const dbRef = getCCTVItemsDbRef();
  if (!dbRef) {
    console.warn('Firebase is not configured. Item saved locally.');
    return null;
  }

  const newItemRef = push(dbRef);
  const itemId = newItemRef.key;
  if (!itemId) return null;

  const fullItem: CCTVItemData = {
    ...item,
    itemId,
    updatedAt: Date.now()
  };

  await set(newItemRef, fullItem);
  return itemId;
}

/**
 * Updates an existing CCTV Item's price/status in Firebase.
 */
export async function updateCCTVItem(itemId: string, updates: Partial<CCTVItemData>): Promise<boolean> {
  const app = getFirebaseApp();
  if (!app || !isFirebaseConfigured() || !itemId) return false;

  const db = getDatabase(app);
  const itemRef = ref(db, `CCTV_Items/${itemId}`);

  await set(itemRef, {
    ...updates,
    updatedAt: Date.now()
  });

  return true;
}

/**
 * Real-time listener for "CCTV_Items"
 */
export function subscribeToCCTVItems(callback: (items: CCTVItemData[]) => void): () => void {
  const dbRef = getCCTVItemsDbRef();
  if (!dbRef) {
    callback([]);
    return () => {};
  }

  const unsubscribe = onValue(dbRef, (snapshot) => {
    const val = snapshot.val();
    if (!val) {
      callback([]);
      return;
    }
    const itemsList: CCTVItemData[] = Object.keys(val).map((key) => ({
      ...val[key],
      itemId: key
    }));
    callback(itemsList);
  });

  return unsubscribe;
}
