import { useEffect, useState } from "react";

const DB_NAME = "video-cache-db";
const DB_VERSION = 1;
const STORE_NAME = "videos";

interface VideoCache {
  videoKey: string;
  blob: Blob;
  timestamp: number;
  size: number;
}

// Initialize IndexedDB
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: "videoKey" });
        objectStore.createIndex("timestamp", "timestamp", { unique: false });
      }
    };
  });
};

// Get video from cache
const getCachedVideo = async (videoKey: string): Promise<Blob | null> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(videoKey);

      request.onsuccess = () => {
        const result = request.result as VideoCache | undefined;
        if (result) {
          // Check if cache is still valid (optional: you can add expiration logic)
          resolve(result.blob);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error getting cached video:", error);
    return null;
  }
};

// Save video to cache
const saveVideoToCache = async (videoKey: string, blob: Blob): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      
      const cacheData: VideoCache = {
        videoKey,
        blob,
        timestamp: Date.now(),
        size: blob.size,
      };

      const request = store.put(cacheData);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error saving video to cache:", error);
  }
};

// Clear old cache entries (optional: to manage storage)
const clearOldCache = async (maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index("timestamp");
      const request = index.openCursor();
      const cutoffTime = Date.now() - maxAge;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          if (cursor.value.timestamp < cutoffTime) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error clearing old cache:", error);
  }
};

export const useVideoCache = (videoKey: string, videoUrl: string) => {
  const [cachedUrl, setCachedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCached, setIsCached] = useState(false);

  useEffect(() => {
    if (!videoKey || !videoUrl) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadVideo = async () => {
      try {
        // First, try to get from cache
        const cachedBlob = await getCachedVideo(videoKey);
        
        if (cachedBlob && isMounted) {
          // Use cached video
          const url = URL.createObjectURL(cachedBlob);
          setCachedUrl(url);
          setIsCached(true);
          setIsLoading(false);
          return;
        }

        // If not cached, fetch and cache it
        if (isMounted) {
          setIsLoading(true);
          const response = await fetch(videoUrl);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch video: ${response.statusText}`);
          }

          const blob = await response.blob();
          
          if (isMounted) {
            // Save to cache
            await saveVideoToCache(videoKey, blob);
            
            // Create object URL
            const url = URL.createObjectURL(blob);
            setCachedUrl(url);
            setIsCached(false);
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error("Error loading video:", error);
        if (isMounted) {
          // Fallback to original URL if cache fails
          setCachedUrl(videoUrl);
          setIsCached(false);
          setIsLoading(false);
        }
      }
    };

    loadVideo();

    // Cleanup: revoke object URL when component unmounts
    return () => {
      isMounted = false;
      if (cachedUrl && cachedUrl.startsWith("blob:")) {
        URL.revokeObjectURL(cachedUrl);
      }
    };
  }, [videoKey, videoUrl]);

  // Cleanup old cache on mount (optional)
  useEffect(() => {
    clearOldCache().catch(console.error);
  }, []);

  return {
    videoUrl: cachedUrl || videoUrl,
    isLoading,
    isCached,
  };
};
