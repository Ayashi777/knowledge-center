import React from 'react';
import { useI18n } from '@app/providers/i18n/i18n';
import { Icon } from '../../../../shared/ui/icons';

interface DocumentFileListProps {
    files: { name: string; url: string; extension?: string }[];
    isLoading: boolean;
    currentUserRole: string;
}

export const DocumentFileList: React.FC<DocumentFileListProps> = ({ files, isLoading, currentUserRole }) => {
    const { t } = useI18n();

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Icon name="loading" className="w-4 h-4" /> Loading files...
            </div>
        );
    }

    if (files.length === 0) {
        return <p className="text-xs text-gray-400 italic">No files available.</p>;
    }

    return (
        <div className="space-y-3">
            {files.map((file) => (
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
                            <p className="text-[9px] text-gray-500 uppercase font-black opacity-60">1.2 MB</p>
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
                            <span className="text-[10px] text-gray-400 font-bold cursor-pointer hover:text-blue-500">
                                {t('docView.uploadNew')}
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};
