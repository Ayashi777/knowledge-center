import { ref, listAll, getDownloadURL, uploadBytes, deleteObject } from 'firebase/storage';
import { storage } from '@shared/api/firebase/firebase';

const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx'];

const isSystemAsset = (name: string) => {
  const n = name.toLowerCase();
  return n.includes('/.system/') || n.startsWith('thumbnail') || n.startsWith('cover_');
};

export const StorageApi = {
    isFileTypeAllowed: (fileName: string): boolean => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        return !!ext && ALLOWED_EXTENSIONS.includes(ext);
    },

    listDocumentFiles: async (docId: string) => {
        const newPathRef = ref(storage, `documents/${docId}/files`);
        const legacyPathRef = ref(storage, `documents/${docId}`);
        
        try {
            let res = await listAll(newPathRef);
            
            if (res.items.length === 0) {
                const legacyRes = await listAll(legacyPathRef);
                if (legacyRes.items.length > 0) {
                    res = legacyRes;
                }
            }

            const files = await Promise.all(
                res.items
                    .filter(item => !isSystemAsset(item.name))
                    .map(async (item) => {
                        const url = await getDownloadURL(item);
                        const extension = item.name.split('.').pop()?.toLowerCase();
                        return { name: item.name, url, extension };
                    })
            );

            return files;
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
        const paths = [
            `documents/${docId}/files/${fileName}`,
            `documents/${docId}/${fileName}`
        ];
        
        for (const path of paths) {
            try {
                const storageRef = ref(storage, path);
                await deleteObject(storageRef);
                break;
            } catch (e) {
                // Ignore missing file errors
            }
        }
    },

    uploadImage: async (file: File, docId: string): Promise<string> => {
        const safeName = file.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
        const path = `documents/${docId}/images/${Date.now()}-${safeName}`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    },

    uploadThumbnail: async (file: File, docId: string): Promise<string> => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        const path = `documents/${docId}/thumbnail.${ext}`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    }
};

// --- Legacy Exports for 1:1 Compatibility with Main ---
export const isFileTypeAllowed = StorageApi.isFileTypeAllowed;
export const uploadDocumentFile = (docId: string, file: File) => StorageApi.uploadFile(file, docId);
export const listDocumentFiles = StorageApi.listDocumentFiles;
export const deleteDocumentFile = StorageApi.deleteFile;
export const uploadImage = StorageApi.uploadImage;
