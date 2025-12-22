import React from 'react';
import { useI18n } from '@app/providers/i18n/i18n';
import { Icon } from '@shared/ui/icons';
import { StorageApi } from '@shared/api/storage/storage.api';

interface DocumentFileListProps {
    docId: string;
    files: { name: string; url: string; extension?: string }[];
    isLoading: boolean;
    currentUserRole: string;
    onRefresh: () => void;
}

export const DocumentFileList: React.FC<DocumentFileListProps> = ({ docId, files, isLoading, currentUserRole, onRefresh }) => {
    const { t } = useI18n();
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!StorageApi.isFileTypeAllowed(file.name)) {
            alert(t('docView.invalidFileType'));
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        try {
            await StorageApi.uploadFile(file, docId);
            onRefresh();
        } catch (error) {
            console.error('Failed to upload file:', error);
            alert('Upload failed');
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (fileName: string) => {
        if (!window.confirm(t('dashboard.confirmDelete'))) return;

        try {
            await StorageApi.deleteFile(docId, fileName);
            onRefresh();
        } catch (error) {
            console.error('Failed to delete file:', error);
            alert('Delete failed');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Icon name="loading" className="w-4 h-4 animate-spin" /> {t('common.loading')}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {files.length === 0 ? (
                <p className="text-xs text-gray-400 italic">{t('docView.filesEmpty')}</p>
            ) : (
                files.map((file) => (
                    <div
                        key={file.name}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-blue-500/30 transition-all group"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                                <Icon
                                    name={file.extension === 'pdf' ? 'document-text' : 'folder'}
                                    className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors"
                                />
                            </div>
                            <div className="min-w-0">
                                <p className="font-black text-[11px] truncate dark:text-white uppercase tracking-tight" title={file.name}>
                                    {file.name}
                                </p>
                                <p className="text-[9px] text-gray-500 uppercase font-black opacity-60">{file.extension?.toUpperCase()}</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <a
                                href={file.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 text-xs font-black text-blue-600 hover:text-blue-700 transition-colors whitespace-nowrap"
                            >
                                <span>{t('common.download')}</span>
                            </a>
                            {currentUserRole === 'admin' && (
                                <button
                                    onClick={() => handleDelete(file.name)}
                                    className="text-[10px] text-red-400 font-bold cursor-pointer hover:text-red-600 transition-colors"
                                >
                                    {t('common.delete')}
                                </button>
                            )}
                        </div>
                    </div>
                ))
            )}
            
            {currentUserRole === 'admin' && (
                <div className="mt-4">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleUpload}
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-[10px] font-black uppercase text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-all flex items-center justify-center gap-2"
                    >
                        <Icon name="plus" className="w-3 h-3" />
                        {t('docView.uploadNew')}
                    </button>
                </div>
            )}
        </div>
    );
};
