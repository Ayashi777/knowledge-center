import { ref, listAll, getDownloadURL, uploadBytes, deleteObject } from 'firebase/storage';
import { storage } from '@shared/api/firebase/firebase';

const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'zip', 'rar', 'jpg', 'jpeg', 'png', 'txt'];

export const StorageApi = {
    isFileTypeAllowed: (fileName: string): boolean => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        return !!ext && ALLOWED_EXTENSIONS.includes(ext);
    },

    listDocumentFiles: async (docId: string) => {
        const newPathRef = ref(storage, `documents/${docId}/files`);
        const legacyPathRef = ref(storage, `documents/${docId}`);
        
        try {
            // Спробуємо новий шлях
            let res = await listAll(newPathRef);
            
            // Якщо в новому шляху нічого немає, спробуємо старий (fallback)
            // Але фільтруємо папку images, якщо вона там є
            if (res.items.length === 0) {
                const legacyRes = await listAll(legacyPathRef);
                // В старому дизайні файли лежали прямо в documents/{docId}
                // Ми беремо тільки файли, ігноруючи підпапки (prefixes)
                if (legacyRes.items.length > 0) {
                    res = legacyRes;
                }
            }

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

    uploadFile: async (file: File, docId: string): Promise<{ name: string; url: string; extension: string }> => {
        const path = `documents/${docId}/files/${file.name}`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        return {
            name: file.name,
            url,
            extension: file.name.split('.').pop()?.toLowerCase() || ''
        };
    },

    deleteFile: async (docId: string, fileName: string): Promise<void> => {
        // Намагаємося видалити з обох місць (для безпеки при legacy)
        const paths = [
            `documents/${docId}/files/${fileName}`,
            `documents/${docId}/${fileName}`
        ];
        
        for (const path of paths) {
            try {
                const storageRef = ref(storage, path);
                await deleteObject(storageRef);
                break; // Якщо видалили, зупиняємось
            } catch (e) {
                // Ignore errors for missing files in one of the paths
            }
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
