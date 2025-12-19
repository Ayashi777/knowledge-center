import React, { forwardRef } from 'react';
import { Document, UserRole } from '../types';
import { useI18n } from '../i18n';
import { Icon } from './icons';
import { formatRelativeTime } from '../utils/format';

export const DocumentThumbnail: React.FC<{ docTitle: string; thumbnailUrl?: string }> = ({ docTitle, thumbnailUrl }) => {
    if (thumbnailUrl) {
        return (
            <div className="aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-800 relative group/thumb">
                <img
                    src={thumbnailUrl}
                    alt={docTitle}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/thumb:scale-105"
                />
                <div className="absolute inset-0 bg-black/5 group-hover/thumb:bg-transparent transition-colors"></div>
            </div>
        );
    }

    return (
        <div className="aspect-[3/4] bg-white dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 p-4 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <div className="text-lg font-black text-gray-700 dark:text-gray-300">CE</div>
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-red-600"></div>
                    <p className="font-bold text-xs text-gray-600 dark:text-gray-400">ACME CORP</p>
                </div>
            </div>
            <h3 className="text-[10px] leading-tight font-bold text-gray-800 dark:text-gray-100 mb-3 flex-shrink-0">{docTitle}</h3>
            <div className="space-y-1.5 flex-grow">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={`p1-${i}`}
                        style={{ width: `${[95, 100, 98, 90][i]}%` }}
                        className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-sm"
                    ></div>
                ))}
                <div className="!mt-4 space-y-1">
                    {[...Array(5)].map((_, i) => (
                        <div key={`tbl-${i}`} className="flex gap-1.5">
                            <div className="h-1.5 bg-gray-300 dark:bg-gray-500 rounded-sm w-1/4"></div>
                            <div className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-sm w-3/4"></div>
                        </div>
                    ))}
                </div>
                <div className="!mt-4 space-y-1">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={`p2-${i}`}
                            style={{ width: `${[100, 95, 50][i]}%` }}
                            className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-sm"
                        ></div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const DocumentListItem = forwardRef<
    HTMLDivElement,
    { doc: Document; onClick: () => void; onEdit: () => void; onDelete: () => void; showAdminControls: boolean }
>(({ doc, onClick, onEdit, onDelete, showAdminControls }, ref) => {
    const { t, lang } = useI18n();
    const docTitle = doc.titleKey ? t(doc.titleKey) : doc.title || '';
    return (
        <div
            ref={ref}
            onClick={onClick}
            onKeyPress={(e) => e.key === 'Enter' && onClick()}
            className="flex items-start sm:items-center justify-between p-4 bg-white/80 dark:bg-gray-800/50 border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 rounded-md group flex-col sm:flex-row gap-4"
            role="button"
            tabIndex={0}
        >
            <div className="flex-grow cursor-pointer">
                <p className="font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-200">{docTitle}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-xs text-blue-500 dark:text-blue-400 font-mono py-1 px-2 bg-blue-50 dark:bg-blue-900/30 rounded-md">
                        {t(doc.categoryKey)}
                    </span>
                    {doc.tags.map((tag) => (
                        <div
                            key={tag}
                            className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-md"
                        >
                            <Icon name="tag" className="w-3 h-3" /> {tag}
                        </div>
                    ))}
                </div>
            </div>
            {showAdminControls ? (
                <div className="flex items-center gap-2 pl-0 sm:pl-4 self-end sm:self-center">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit();
                        }}
                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                            <path
                                fillRule="evenodd"
                                d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path
                                fillRule="evenodd"
                                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                </div>
            ) : (
                <p className="text-sm text-gray-500 dark:text-gray-500 font-mono whitespace-nowrap self-end sm:self-center">
                    {formatRelativeTime(doc.updatedAt, lang, t)}
                </p>
            )}
        </div>
    );
});
DocumentListItem.displayName = 'DocumentListItem';

export const DocumentGridItem: React.FC<{ doc: Document; onClick: () => void; onRequireLogin: () => void; isGuest: boolean }> = ({
    doc,
    onClick,
    onRequireLogin,
    isGuest,
}) => {
    const { t } = useI18n();
    const docTitle = doc.titleKey ? t(doc.titleKey) : doc.title || '';

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isGuest) {
            onRequireLogin();
        } else {
            alert('Downloading...');
        }
    };

    const handleShare = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (navigator.share) {
            navigator
                .share({
                    title: docTitle,
                    text: `Check out this document: ${docTitle}`,
                    url: window.location.href,
                })
                .catch(console.error);
        } else {
            alert('Share functionality not available.');
        }
    };

    return (
        <div className="group cursor-pointer" onClick={onClick} onKeyPress={(e) => e.key === 'Enter' && onClick()} role="button" tabIndex={0}>
            <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden transition-all duration-300 group-hover:shadow-2xl shadow-lg shadow-gray-200/50 dark:shadow-black/20 border border-gray-200 dark:border-gray-700/80 group-hover:border-gray-300 dark:group-hover:border-gray-600 group-hover:-translate-y-1">
                <DocumentThumbnail docTitle={docTitle} thumbnailUrl={(doc as any).thumbnailUrl} />
            </div>
            <div className="pt-4 pb-2 px-1">
                <p className="font-semibold text-gray-800 dark:text-gray-200 mb-3 truncate group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
                    {docTitle}
                </p>
                <div className="flex items-center gap-6 text-sm">
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-colors"
                    >
                        <Icon name="download" className="w-5 h-5" />
                        <span className="font-medium">{t('common.download')}</span>
                    </button>
                    <button
                        onClick={handleShare}
                        className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-colors"
                    >
                        <Icon name="share" className="w-5 h-5" />
                        <span className="font-medium">{t('common.share')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
