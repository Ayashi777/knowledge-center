import { ref, uploadBytes, getDownloadURL, listAll, deleteObject } from "firebase/storage";
import { storage } from "../firebase";

const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx'];

/**
 * Validates if the file extension is allowed
 */
export const isFileTypeAllowed = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension && ALLOWED_EXTENSIONS.includes(extension);
};

/**
 * Uploads a file to a specific document folder in Firebase Storage
 * Path: documents/{docId}/{originalName}
 */
export const uploadDocumentFile = async (docId: string, file: File) => {
    if (!isFileTypeAllowed(file.name)) {
        throw new Error("Invalid file type. Only PDF, Word, and Excel files are allowed.");
    }

    const storageRef = ref(storage, `documents/${docId}/${file.name}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
        url: downloadURL,
        name: file.name,
        size: file.size,
        path: snapshot.ref.fullPath,
        extension: file.name.split('.').pop()?.toLowerCase()
    };
};

/**
 * Lists all files associated with a document
 */
export const listDocumentFiles = async (docId: string) => {
    try {
        const folderRef = ref(storage, `documents/${docId}`);
        const result = await listAll(folderRef);
        
        const filePromises = result.items.map(async (item) => {
            const url = await getDownloadURL(item);
            const metadata = item.name.split('.');
            return {
                name: item.name,
                url: url,
                extension: metadata.pop()?.toLowerCase()
            };
        });

        return await Promise.all(filePromises);
    } catch (error) {
        console.error("Error listing files:", error);
        return [];
    }
};

/**
 * Deletes a file from storage
 */
export const deleteDocumentFile = async (docId: string, fileName: string) => {
    const fileRef = ref(storage, `documents/${docId}/${fileName}`);
    await deleteObject(fileRef);
};
