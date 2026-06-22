const DB_NAME = "pano-loop-lab";
const DB_VERSION = 1;
const STORE_NAME = "workbench-scenes";
const CURRENT_SCENE_KEY = "current";

function openWorkbenchDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB open failed."));
    request.onblocked = () => reject(new Error("IndexedDB is blocked by another open tab."));
  });
}

function closeAfter<T>(database: IDBDatabase, task: Promise<T>): Promise<T> {
  return task.finally(() => database.close());
}

export async function loadPersistedWorkbenchScene(): Promise<string | null> {
  const database = await openWorkbenchDatabase();

  return closeAfter(
    database,
    new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(CURRENT_SCENE_KEY);

      request.onsuccess = () => {
        resolve(typeof request.result === "string" ? request.result : null);
      };
      request.onerror = () => reject(request.error ?? new Error("Scene load failed."));
      transaction.onerror = () => reject(transaction.error ?? new Error("Scene load transaction failed."));
    }),
  );
}

export async function savePersistedWorkbenchScene(scene: string): Promise<void> {
  const database = await openWorkbenchDatabase();

  return closeAfter(
    database,
    new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(scene, CURRENT_SCENE_KEY);

      request.onerror = () => reject(request.error ?? new Error("Scene save failed."));
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("Scene save transaction failed."));
    }),
  );
}
