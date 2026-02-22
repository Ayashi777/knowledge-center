import { ref, listAll, getDownloadURL, uploadBytes, deleteObject } from 'firebase/storage';
import { storage } from '@shared/api/firebase/firebase';

const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx'];

const isSystemAsset = (name: string) => {
  const n = name.toLowerCase();
  // 🔥 Improved detection of thumbnails
  return n.includes('/.system/') || n.includes('thumbnail.') || n.startsWith('thumbnail') || n.startsWith('cover_');
};

export const StorageApi = {
    isFileTypeAllowed: (fileName: string): boolean => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        return !!ext && ALLOWED_EXTENSIONS.includes(ext);
    },

    listDocumentFiles: async (docId: string) => {
        const newPathRef = ref(storage, `documents/${docId}/files`);
        
        try {
            // Primary source of truth for files
            const newRes = await listAll(newPathRef);

            // Map and filter items from the modern location
            const fetchItemDetails = async (item: any) => {
                const url = await getDownloadURL(item);
                const extension = item.name.split('.').pop()?.toLowerCase();
                return { name: item.name, url, extension };
            };

            const modernItems = await Promise.all(
                newRes.items
                    .filter(item => !isSystemAsset(item.name))
                    .map(fetchItemDetails)
            );

            // 🔥 Filter out empty/invalid items and check again for system assets
            return modernItems.filter(f => !isSystemAsset(f.name));
        } catch (e) {
            // Permission-denied is expected for documents without download access.
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

    // Delete everything related to a document (files + images + thumbnail)
    deleteAllDocumentFiles: async (docId: string): Promise<void> => {
        const folders = [
            `documents/${docId}/files`,
            `documents/${docId}/images`,
            `documents/${docId}` // Legacy folder
        ];

        for (const folderPath of folders) {
            try {
                const folderRef = ref(storage, folderPath);
                const res = await listAll(folderRef);
                const deletePromises = res.items.map(item => deleteObject(item));
                await Promise.all(deletePromises);
            } catch (e) {
                // Ignore errors (like folder doesn't exist)
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
export const deleteAllDocumentFiles = StorageApi.deleteAllDocumentFiles;
