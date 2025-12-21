import { ref, listAll, getDownloadURL, uploadBytes } from 'firebase/storage';
import { storage } from '@shared/api/firebase/firebase';

export const StorageApi = {
    listDocumentFiles: async (docId: string) => {
        const listRef = ref(storage, `documents/${docId}/files`);
        try {
            const res = await listAll(listRef);
            return await Promise.all(
                res.items.map(async (item) => {
                    const url = await getDownloadURL(item);
                    const extension = item.name.split('.').pop()?.toLowerCase();
                    return { name: item.name, url, extension };
                })
            );
        } catch (e) {
            console.error('Storage list failed', e);
            return [];
        }
    },

    uploadImage: async (file: File, docId: string): Promise<string> => {
        const safeName = file.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
        const path = `documents/${docId}/images/${Date.now()}-${safeName}`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    }
};
