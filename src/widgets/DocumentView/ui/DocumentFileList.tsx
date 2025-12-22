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
    docThumbnail?: string; // 🔥 Added for preview
}

export const DocumentFileList: React.FC<DocumentFileListProps> = ({ 
    docId, 
    files, 
    isLoading, 
    currentUserRole, 
    onRefresh,
    docThumbnail
}) => {
    const { t } = useI18n();
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!StorageApi.isFileTypeAllowed(file.name)) {
            alert(t('docView.invalidFileType'));
            return;
        }

        try {
            await StorageApi.uploadFile(file, docId);
            onRefresh();
        } catch (error) {
            console.error('Failed to upload file:', error);
            alert('Upload failed');
        }
    };

    const handleDelete = async (fileName: string) => {
        if (!window.confirm(t('dashboard.confirmDelete'))) return;
        try {
            await StorageApi.deleteFile(docId, fileName);
            onRefresh();
        } catch (error) {
            console.error('Failed to delete file:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-10 text-gray-400">
                <Icon name="loading" className="w-6 h-6 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {files.length === 0 ? (
                <div className="p-6 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl text-center">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{t('docView.filesEmpty')}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {files.slice(0, 3).map((file) => (
                        <div
                            key={file.name}
                            className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                        >
                            {/* 🔥 Professional Preview Area */}
                            <div className="aspect-[1/1.414] bg-gray-50 dark:bg-gray-900 relative overflow-hidden flex items-center justify-center">
                                {docThumbnail ? (
                                    <img 
                                        src={docThumbnail} 
                                        alt="Preview" 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 opacity-20">
                                         <Icon name="document-text" className="w-12 h-12" />
                                         <span className="font-black text-[10px] uppercase">PDF Document</span>
                                    </div>
                                )}
                                
                                {/* Status Icon Overlay */}
                                <div className="absolute top-3 right-3 p-1.5 bg-red-600 text-white rounded-lg shadow-lg text-[8px] font-black uppercase tracking-tighter z-10">
                                    PDF
                                </div>

                                {/* Hover CTA Overlay */}
                                <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-colors duration-300" />
                            </div>

                            {/* File Info & Button */}
                            <div className="p-4 border-t border-gray-50 dark:border-gray-800">
                                <p className="font-bold text-[11px] text-gray-900 dark:text-white uppercase tracking-tight line-clamp-1 mb-3" title={file.name}>
                                    {file.name}
                                </p>
                                
                                <div className="space-y-2">
                                    <a
                                        href={file.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md shadow-blue-500/10"
                                    >
                                        <Icon name="download" className="w-3 h-3" />
                                        <span>Download</span>
                                    </a>

                                    {currentUserRole === 'admin' && (
                                        <button
                                            onClick={() => handleDelete(file.name)}
                                            className="w-full py-1.5 text-[9px] text-gray-400 hover:text-red-500 font-bold uppercase transition-colors"
                                        >
                                            {t('common.delete')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {currentUserRole === 'admin' && (
                <div className="mt-4">
                    <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-3 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl text-[9px] font-black uppercase text-gray-400 hover:border-blue-500 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
                    >
                        <Icon name="plus" className="w-3 h-3" />
                        Upload PDF
                    </button>
                </div>
            )}
        </div>
    );
};
