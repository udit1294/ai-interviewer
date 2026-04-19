export const saveLocalAudio = async (base64Audio: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('AIInterviewerStore', 1);
    
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('media')) {
        db.createObjectStore('media');
      }
    };
    
    request.onsuccess = (e: any) => {
      const db = e.target.result;
      
      // Ensure the object store exists before trying to access it
      if (!db.objectStoreNames.contains('media')) {
        // If it doesn't exist but we didn't upgrade, we have to bump version
        // In practice this shouldn't happen unless db was created elsewhere with same name
        db.close();
        return resolve(false);
      }
      
      const tx = db.transaction('media', 'readwrite');
      const store = tx.objectStore('media');
      
      const putReq = store.put(base64Audio, 'latestAudioRecording');
      
      putReq.onsuccess = () => {
        resolve(true);
      };
      
      putReq.onerror = () => {
        console.error('Error saving audio to IndexedDB', putReq.error);
        resolve(false);
      };
    };
    
    request.onerror = (e: any) => {
      console.error('IndexedDB open error:', e.target.error);
      resolve(false);
    };
  });
};

export const getLocalAudio = async (): Promise<string | null> => {
  return new Promise((resolve) => {
    const request = indexedDB.open('AIInterviewerStore', 1);
    
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('media')) {
        db.createObjectStore('media');
      }
    };
    
    request.onsuccess = (e: any) => {
      const db = e.target.result;
      
      if (!db.objectStoreNames.contains('media')) {
        db.close();
        return resolve(null);
      }
      
      const tx = db.transaction('media', 'readonly');
      const store = tx.objectStore('media');
      const getReq = store.get('latestAudioRecording');
      
      getReq.onsuccess = () => {
        resolve(getReq.result || null);
      };
      
      getReq.onerror = () => {
        console.error('Error getting audio from IndexedDB', getReq.error);
        resolve(null);
      };
    };
    
    request.onerror = (e: any) => {
      console.error('IndexedDB open error:', e.target.error);
      resolve(null);
    };
  });
};
