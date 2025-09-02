import React, { useState, useRef, useEffect, forwardRef, createRef, useMemo } from 'react';
import { Category, Document, DocumentContent, IconName, UserRole } from './types';
import { CATEGORIES, RECENT_DOCUMENTS as initialDocuments } from './constants';
import { Icon } from './components/icons';
import { useI18n, Language } from './i18n';

const categoryPermissions = new Map(CATEGORIES.map(c => [c.nameKey, c.viewPermissions]));

type DownloadStatus = 'idle' | 'loading' | 'success';
type UploadStatus = 'idle' | 'loading' | 'success';

// --- Utility Functions ---

function formatRelativeTime(date: Date, lang: Language, t: (key: string) => string): string {
    const now = new Date();
    const diffSeconds = Math.round((date.getTime() - now.getTime()) / 1000);

    const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });

    if (Math.abs(diffSeconds) < 60) {
        return t('common.justNow');
    }
    
    const diffMinutes = Math.round(diffSeconds / 60);
    if (Math.abs(diffMinutes) < 60) {
        return rtf.format(diffMinutes, 'minute');
    }

    const diffHours = Math.round(diffMinutes / 60);
    if (Math.abs(diffHours) < 24) {
        return rtf.format(diffHours, 'hour');
    }
    
    const diffDays = Math.round(diffHours / 24);
    if (Math.abs(diffDays) < 30) {
        return rtf.format(diffDays, 'day');
    }

    const diffMonths = Math.round(diffDays / 30);
    if(Math.abs(diffMonths) < 12) {
        return rtf.format(diffMonths, 'month');
    }
    
    const diffYears = Math.round(diffMonths/12);
    return rtf.format(diffYears, 'year');
}


// --- Reusable Child Components ---

const CategoryCard: React.FC<{ category: Category, onClick: () => void, isSelected: boolean }> = ({ category, onClick, isSelected }) => {
  const { t } = useI18n();
  const baseClasses = "group relative flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 border rounded-lg transition-all duration-300 cursor-pointer h-full";
  const selectedClasses = "border-blue-500 bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500/50";
  const hoverClasses = "hover:border-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700/50";

  return (
    <div onClick={onClick} className={`${baseClasses} ${isSelected ? selectedClasses : `border-gray-200 dark:border-gray-700 ${hoverClasses}`}`} role="button" tabIndex={0}>
      <div className={`transition-colors duration-300 ${isSelected ? 'text-blue-500 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400'}`}>
        <Icon name={category.iconName} className="w-10 h-10" />
      </div>
      <p className={`mt-4 text-sm font-medium text-center transition-colors duration-300 ${isSelected ? 'text-blue-600 dark:text-white' : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'}`}>
        {t(category.nameKey)}
      </p>
    </div>
  );
};

const Tag: React.FC<{ name: string; isSelected: boolean; onClick: () => void }> = ({ name, isSelected, onClick }) => {
    const base = "flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full cursor-pointer transition-colors duration-200";
    const selected = "bg-blue-600 text-white";
    const idle = "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600";
    
    return (
        <button onClick={onClick} className={`${base} ${isSelected ? selected : idle}`}>
            <Icon name="tag" className="w-3 h-3" />
            <span>{name}</span>
        </button>
    );
};

const DocumentListItem = forwardRef<HTMLDivElement, { doc: Document, onClick: () => void, onEdit: () => void, onDelete: () => void, showAdminControls: boolean }>(({ doc, onClick, onEdit, onDelete, showAdminControls }, ref) => {
  const { t, lang } = useI18n();
  const docTitle = doc.titleKey ? t(doc.titleKey) : doc.title;
  return (
    <div ref={ref} onClick={onClick} onKeyPress={(e) => e.key === 'Enter' && onClick()} className="flex items-start sm:items-center justify-between p-4 bg-white/80 dark:bg-gray-800/50 border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 rounded-md group flex-col sm:flex-row gap-4" role="button" tabIndex={0}>
      <div className="flex-grow cursor-pointer">
        <p className='font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-200'>
          {docTitle}
        </p>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-xs text-blue-500 dark:text-blue-400 font-mono py-1 px-2 bg-blue-50 dark:bg-blue-900/30 rounded-md">{t(doc.categoryKey)}</span>
            {doc.tags.map(tag => (
                <div key={tag} className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-md">
                   <Icon name="tag" className="w-3 h-3"/> {tag}
                </div>
            ))}
        </div>
      </div>
      {showAdminControls ? (
        <div className="flex items-center gap-2 pl-0 sm:pl-4 self-end sm:self-center">
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors" aria-label={t('common.edit') + ' ' + docTitle}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors" aria-label={t('common.delete') + ' ' + docTitle}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          </button>
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-500 font-mono whitespace-nowrap self-end sm:self-center">{formatRelativeTime(doc.updatedAt, lang, t)}</p>
      )}
    </div>
  );
});
DocumentListItem.displayName = 'DocumentListItem';


const DownloadButton = forwardRef<HTMLButtonElement, { icon: IconName, text: string, onClick: () => void, status: DownloadStatus }>(({ icon, text, onClick, status }, ref) => {
    const { t } = useI18n();
    const content = {
        idle: {
            icon: <Icon name={icon} className="w-5 h-5 text-blue-500 dark:text-blue-400" />,
            text: text,
        },
        loading: {
            icon: <Icon name="loading" className="w-5 h-5 text-blue-500 dark:text-blue-400" />,
            text: t('common.loading'),
        },
        success: {
            icon: <Icon name="check-circle" className="w-5 h-5 text-green-500" />,
            text: t('common.completed'),
        }
    };
    
    const current = content[status];
    const baseStyle = "flex items-center justify-center gap-3 px-4 py-2 border rounded-md transition-all duration-200 disabled:cursor-not-allowed w-44";
    const statusStyles = {
      idle: 'bg-slate-100 dark:bg-gray-700 border-slate-200 dark:border-gray-600 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-600',
      loading: 'bg-slate-200 dark:bg-gray-600 border-slate-300 dark:border-gray-500 text-slate-700 dark:text-gray-300',
      success: 'bg-green-100 dark:bg-green-800/50 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300',
    };

    return (
        <button
            ref={ref}
            onClick={onClick}
            disabled={status !== 'idle'}
            className={`${baseStyle} ${statusStyles[status]}`}
        >
            {current.icon}
            <span className="text-sm font-medium">{current.text}</span>
        </button>
    );
});
DownloadButton.displayName = 'DownloadButton';

const UploadButton: React.FC<{ text: string, onFileSelect: (file: File) => void, status: UploadStatus }> = ({ text, onFileSelect, status }) => {
    const { t } = useI18n();
    const inputRef = useRef<HTMLInputElement>(null);

    const content = {
        idle: { icon: <Icon name="upload" className="w-5 h-5" />, text },
        loading: { icon: <Icon name="loading" className="w-5 h-5" />, text: t('common.uploading') },
        success: { icon: <Icon name="check-circle" className="w-5 h-5 text-green-500" />, text: t('common.completed') },
    };
    
    const current = content[status];
    const baseStyle = "flex items-center justify-center gap-3 px-4 py-2 border rounded-md transition-all duration-200 disabled:cursor-not-allowed w-52";
    const statusStyles = {
      idle: 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600',
      loading: 'bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-300',
      success: 'bg-green-100 dark:bg-green-800/50 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300',
    };
    
    return (
        <>
            <input 
                type="file" 
                ref={inputRef}
                className="hidden"
                onChange={(e) => {
                    if (e.target.files?.[0]) {
                        onFileSelect(e.target.files[0]);
                    }
                }}
            />
            <button
                onClick={() => inputRef.current?.click()}
                disabled={status !== 'idle'}
                className={`${baseStyle} ${statusStyles[status]}`}
            >
                {current.icon}
                <span className="text-sm font-medium">{current.text}</span>
            </button>
        </>
    );
};

// --- Chat and Co-Browsing Components ---

const AgentCursor: React.FC<{ position: { top: number; left: number } }> = ({ position }) => {
    const { t } = useI18n();
    return (
      <div className="absolute z-50 flex items-center gap-2 transition-all duration-700 ease-out pointer-events-none" style={{ top: `${position.top}px`, left: `${position.left}px`, opacity: position.top > 0 ? 1 : 0 }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-blue-500 dark:text-blue-400 drop-shadow-lg">
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
          <span className="px-2 py-1 text-sm text-white bg-blue-500 rounded-md shadow-lg">{t('chat.agentHandle')}</span>
      </div>
    );
};
type ChatMessage = {
  id: number;
  sender: 'user' | 'agent';
  text: string | React.ReactNode;
  rated?: boolean;
};

const InteractiveChatWindow: React.FC<{ onClose: () => void; onStartCoBrowse: () => void }> = ({ onClose, onStartCoBrowse }) => {
    const { t } = useI18n();
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: 1, sender: 'agent', text: t('chat.welcome') },
        { id: 2, sender: 'agent', text: (
            <div className="flex flex-col gap-2">
                <button className="chat-button">{t('chat.quickReplies.findDoc')}</button>
                <button className="chat-button">{t('chat.quickReplies.contactSupport')}</button>
            </div>
        ), rated: true }, // Not rateable
    ]);
    const [feedbackGiven, setFeedbackGiven] = useState<Record<number, boolean>>({});
    const chatBodyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatBodyRef.current?.scrollTo({ top: chatBodyRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages]);

    const handleQuickReply = (question: string) => {
        const userMessage: ChatMessage = { id: Date.now(), sender: 'user', text: question };
        setMessages(prev => [...prev.filter(m => m.id !== 2), userMessage]);

        setTimeout(() => {
            let agentResponse: ChatMessage;
            if (question === t('chat.quickReplies.findDoc')) {
                agentResponse = { id: Date.now() + 1, sender: 'agent', text: t('chat.responses.findDoc') };
            } else {
                agentResponse = { id: Date.now() + 1, sender: 'agent', text: t('chat.responses.contactSupport') };
            }
            setMessages(prev => [...prev, agentResponse]);
        }, 1000);
    };
    
    const handleFeedback = (messageId: number, rating: 'good' | 'bad') => {
        setFeedbackGiven(prev => ({ ...prev, [messageId]: true }));
        const thankYouMessage: ChatMessage = { id: Date.now(), sender: 'agent', text: t('chat.feedbackThanks'), rated: true };
        setTimeout(() => {
            setMessages(prev => [...prev, thankYouMessage]);
        }, 500);
    };

    return (
        <div className="fixed bottom-24 right-6 w-80 h-[28rem] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl flex flex-col z-40 animate-fade-in-up">
            <header className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                <h3 className="font-semibold text-gray-800 dark:text-white">{t('chat.title')}</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-800 dark:hover:text-white text-2xl leading-none">&times;</button>
            </header>
            <div ref={chatBodyRef} className="flex-grow p-4 text-sm text-gray-600 dark:text-gray-300 space-y-4 overflow-y-auto">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                        <div
                            className={`p-3 rounded-lg max-w-xs ${
                                msg.sender === 'agent'
                                ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                                : 'bg-blue-600 text-white'
                            }`}
                             onClick={(e) => {
                                if ((e.target as HTMLElement).tagName === 'BUTTON') {
                                    handleQuickReply((e.target as HTMLElement).innerText);
                                }
                            }}
                        >
                           {msg.text}
                        </div>
                        {msg.sender === 'agent' && !msg.rated && !feedbackGiven[msg.id] && (
                            <div className="flex items-center gap-2 mt-2">
                                <button onClick={() => handleFeedback(msg.id, 'good')} className="p-1 text-gray-400 hover:text-green-500 transition-colors">
                                    <Icon name="thumb-up" className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleFeedback(msg.id, 'bad')} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                                    <Icon name="thumb-down" className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <footer className="p-3 border-t border-gray-200 dark:border-gray-600">
                <button onClick={onStartCoBrowse} className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-semibold">
                    {t('chat.startCoBrowse')}
                </button>
            </footer>
             <style>{`.chat-button { width: 100%; text-align: left; padding: 8px 12px; border-radius: 6px; background-color: rgba(255, 255, 255, 0.5); border: 1px solid #e5e7eb; } .dark .chat-button { background-color: rgba(255, 255, 255, 0.1); border-color: #4b5563; } .chat-button:hover { background-color: rgba(255,255,255,1); } .dark .chat-button:hover { background-color: rgba(255,255,255,0.2); }`}</style>
        </div>
    );
};

// --- Admin & Access Control Components ---
const UserAccessControl: React.FC<{ role: UserRole; onLoginClick: () => void; onLogout: () => void; }> = ({ role, onLoginClick, onLogout }) => {
    const { t } = useI18n();
    return (
    <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('header.currentRole')}: <span className="font-bold text-blue-600 dark:text-blue-400 capitalize">{t(`roles.${role}`)}</span>
        </span>
        {role !== 'guest' ? (
            <button onClick={onLogout} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors">{t('header.logout')}</button>
        ) : (
            <button onClick={onLoginClick} className="px-3 py-1 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow">
                {t('header.login')}
            </button>
        )}
    </div>
)};

const LoginModal: React.FC<{ onLogin: (role: UserRole) => void; onClose: () => void; context: 'view' | 'download' | 'login' }> = ({ onLogin, onClose, context }) => {
    const { t } = useI18n();
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
           if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const roles: { role: UserRole, label: string, description: string }[] = [
        { role: 'foreman', label: t('loginModal.roles.foreman'), description: t('loginModal.roles.foremanDesc') },
        { role: 'designer', label: t('loginModal.roles.designer'), description: t('loginModal.roles.designerDesc') },
        { role: 'admin', label: t('loginModal.roles.admin'), description: t('loginModal.roles.adminDesc') },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-8 border border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-600/20 mb-4">
                        <Icon name="lock-closed" className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('loginModal.accessRequired')}</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">{t(`loginModal.context.${context}`)}</p>
                </div>
                <div className="space-y-3">
                    {roles.map(({ role, label, description }) => (
                        <button key={role} type="button" onClick={() => onLogin(role as UserRole)} className="w-full text-left p-4 rounded-md bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-colors">
                            <p className="font-semibold text-gray-800 dark:text-white">{label}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
                        </button>
                    ))}
                </div>
                 <div className="mt-6 text-center">
                    <button type="button" onClick={onClose} className="w-full sm:w-auto px-6 py-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">{t('common.cancel')}</button>
                </div>
            </div>
        </div>
    );
};


const DocumentEditorModal: React.FC<{ doc: Partial<Document> | null, onSave: (doc: Partial<Document>) => void, onClose: () => void, availableCategories: Category[] }> = ({ doc, onSave, onClose, availableCategories }) => {
    const { t } = useI18n();
    const [title, setTitle] = useState((doc?.titleKey ? t(doc.titleKey) : doc?.title) || '');
    const [category, setCategory] = useState(doc?.categoryKey || availableCategories[0]?.nameKey || '');
    const [tags, setTags] = useState(doc?.tags?.join(', ') || '');

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
           if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const docToSave: Partial<Document> = {
            id: doc?.id,
            title: title, // Always save to raw title
            categoryKey: category,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        };
        onSave(docToSave);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6 border border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{doc?.id ? t('editorModal.editTitle') : t('editorModal.createTitle')}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="doc-title" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{t('editorModal.labelTitle')}</label>
                        <input id="doc-title" type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500" required />
                    </div>
                     <div className="mb-4">
                        <label htmlFor="doc-category" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{t('editorModal.labelCategory')}</label>
                        <select id="doc-category" value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500">
                            {availableCategories.map(cat => <option key={cat.id} value={cat.nameKey}>{t(cat.nameKey)}</option>)}
                        </select>
                    </div>
                    <div className="mb-6">
                        <label htmlFor="doc-tags" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{t('editorModal.labelTags')}</label>
                        <input id="doc-tags" type="text" value={tags} onChange={e => setTags(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500" placeholder={t('editorModal.placeholderTags')}/>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">{t('common.cancel')}</button>
                        <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors">{t('common.save')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ThemeSwitcher: React.FC<{ theme: 'light' | 'dark'; toggleTheme: () => void }> = ({ theme, toggleTheme }) => {
    const { t } = useI18n();
    return (
    <button
        onClick={toggleTheme}
        className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label={t('header.toggleTheme')}
    >
        {theme === 'light' ? <Icon name="moon" className="w-6 h-6" /> : <Icon name="sun" className="w-6 h-6" />}
    </button>
)};

const LanguageSwitcher: React.FC = () => {
    const { lang, setLang } = useI18n();
    
    return (
        <div className="flex items-center p-1 bg-gray-200 dark:bg-gray-700 rounded-full">
            <button
                onClick={() => setLang('en')}
                className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${lang === 'en' ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
            >
                EN
            </button>
            <button
                onClick={() => setLang('uk')}
                className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${lang === 'uk' ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
            >
                UA
            </button>
        </div>
    );
};

// --- Page Views ---

const DashboardView: React.FC<{ 
  onSelectDoc: (doc: Document) => void, 
  docRefs: React.RefObject<HTMLDivElement>[],
  searchTerm: string,
  onSearchChange: (term: string) => void,
  filteredDocs: Document[],
  showAdminControls: boolean,
  onEditDoc: (doc: Document) => void,
  onDeleteDoc: (id: string) => void,
  onAddNewDoc: () => void,
  selectedCategory: string | null,
  onCategorySelect: (categoryName: string) => void,
  visibleCategories: Category[],
  allTags: string[],
  selectedTags: Set<string>,
  onTagSelect: (tagName: string) => void,
}> = ({ 
    onSelectDoc, docRefs, searchTerm, onSearchChange, filteredDocs, showAdminControls, 
    onEditDoc, onDeleteDoc, onAddNewDoc, selectedCategory, onCategorySelect, visibleCategories,
    allTags, selectedTags, onTagSelect
}) => {
    const { t } = useI18n();
    return (
  <>
    <header className="mb-12 text-center pt-16 sm:pt-12">
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter text-gray-900 dark:text-white">{t('dashboard.title')}</h1>
      <p className="mt-3 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">{t('dashboard.description')}</p>
      <div className="mt-8 max-w-2xl mx-auto">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg className="h-5 w-5 text-gray-400 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" /></svg>
          </div>
          <input 
            type="search" 
            name="search" 
            id="search" 
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full rounded-md border-0 bg-gray-100 dark:bg-gray-800 py-3 pl-10 pr-3 text-gray-900 dark:text-gray-200 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 transition-all" 
            placeholder={t('dashboard.searchPlaceholder')}
          />
        </div>
      </div>
    </header>
    <main className="space-y-12">
      <section>
        <h2 className="text-2xl font-semibold tracking-tight text-blue-600 dark:text-blue-400 border-b-2 border-gray-200 dark:border-gray-700 pb-2 mb-6">{t('dashboard.categoryView')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-4">
          {visibleCategories.map(category => <CategoryCard key={category.id} category={category} onClick={() => onCategorySelect(category.nameKey)} isSelected={selectedCategory === category.nameKey} />)}
        </div>
      </section>

      {allTags.length > 0 && (
          <section>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-300 mb-3">{t('dashboard.filterByTags')}</h3>
              <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                      <Tag key={tag} name={tag} isSelected={selectedTags.has(tag)} onClick={() => onTagSelect(tag)} />
                  ))}
              </div>
          </section>
      )}

      <section>
        <div className="flex justify-between items-center border-b-2 border-gray-200 dark:border-gray-700 pb-2 mb-6">
            <div className="flex items-baseline gap-4 flex-wrap">
                 <h2 className="text-2xl font-semibold tracking-tight text-blue-600 dark:text-blue-400">
                    {selectedCategory ? t('common.documentsFor', { category: t(selectedCategory) }) : t('common.allDocuments')}
                </h2>
                {(selectedCategory || selectedTags.size > 0) && (
                    <button onClick={() => { onCategorySelect(selectedCategory!); onTagSelect(''); }} className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors">
                        {t('common.resetFilters')}
                    </button>
                )}
            </div>
            {showAdminControls && (
                <button onClick={onAddNewDoc} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-semibold whitespace-nowrap">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                    <span>{t('common.add')}</span>
                </button>
            )}
        </div>
        <div className="space-y-3">
          {filteredDocs.length > 0 ? (
            filteredDocs.map((doc, index) => <DocumentListItem key={doc.id} doc={doc} onClick={() => onSelectDoc(doc)} ref={docRefs[index]} onEdit={() => onEditDoc(doc)} onDelete={() => onDeleteDoc(doc.id)} showAdminControls={showAdminControls} />)
          ) : (
            <div className="text-center py-10 px-4 bg-gray-100/50 dark:bg-gray-800/30 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400">{t('dashboard.noResults')}</p>
              <p className="text-gray-600 dark:text-gray-500 text-sm mt-1">{t('dashboard.noResultsDescription')}</p>
            </div>
          )}
        </div>
      </section>
    </main>
  </>
)};

const EditableField: React.FC<{ label: string; value: string; onChange: (value: string) => void; multiline?: boolean; rows?: number; }> = ({ label, value, onChange, multiline = false, rows = 4 }) => (
  <div className="mb-4">
    <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">{label}</label>
    {multiline ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
        rows={rows}
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
      />
    )}
  </div>
);

const emptyContentTemplate: DocumentContent = {
    intro: '', section1Title: '', section1Body: '', section1List: '',
    section2Title: '', section2Body: '', importantNote: '',
    section3Title: '', section3Body: ''
};


const DocumentView: React.FC<{ doc: Document, onClose: () => void, coBrowseRef: React.RefObject<HTMLButtonElement>, onRequireLogin: () => void, currentUserRole: UserRole, onUpdateContent: (docId: string, lang: Language, newContent: DocumentContent) => void }> = ({ doc, onClose, coBrowseRef, onRequireLogin, currentUserRole, onUpdateContent }) => {
    const { t, lang } = useI18n();
    const [downloadStatuses, setDownloadStatuses] = useState<{ pdf: DownloadStatus; dwg: DownloadStatus }>({ pdf: 'idle', dwg: 'idle' });
    const [uploadStatuses, setUploadStatuses] = useState<{ pdf: UploadStatus; dwg: UploadStatus }>({ pdf: 'idle', dwg: 'idle' });
    
    const [isEditingContent, setIsEditingContent] = useState(false);
    const [editableContent, setEditableContent] = useState<DocumentContent>(doc.content[lang] as DocumentContent || emptyContentTemplate);

    useEffect(() => {
        setEditableContent(doc.content[lang] as DocumentContent || emptyContentTemplate)
    }, [doc, lang]);


    const handleDownload = (fileType: 'pdf' | 'dwg') => {
        if (currentUserRole === 'guest') {
            onRequireLogin();
            return;
        }

        setDownloadStatuses(prev => ({ ...prev, [fileType]: 'loading' }));
        setTimeout(() => setDownloadStatuses(prev => ({ ...prev, [fileType]: 'success' })), 1500);
        setTimeout(() => setDownloadStatuses(prev => ({ ...prev, [fileType]: 'idle' })), 3500);
    };

    const handleFileUpload = (fileType: 'pdf' | 'dwg') => {
        setUploadStatuses(prev => ({...prev, [fileType]: 'loading'}));
        setTimeout(() => setUploadStatuses(prev => ({...prev, [fileType]: 'success'})), 1500);
        setTimeout(() => setUploadStatuses(prev => ({...prev, [fileType]: 'idle'})), 3500);
    };

    const handleSaveContent = () => {
        onUpdateContent(doc.id, lang, editableContent);
        setIsEditingContent(false);
    }
    
    const docTitle = doc.titleKey ? t(doc.titleKey) : doc.title || '';
    const currentContent = doc.content[lang] || emptyContentTemplate;

    return (
        <div className="animate-fade-in pt-16 sm:pt-12">
            <header className="mb-8">
                <nav className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex flex-wrap items-center">
                    <a href="#" onClick={(e) => { e.preventDefault(); onClose(); }} className="hover:text-blue-600 dark:hover:text-blue-400">{t('dashboard.title')}</a>
                    <span className="mx-2">/</span>
                    <span className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">{t(doc.categoryKey)}</span>
                    <span className="mx-2">/</span>
                    <span className="text-gray-800 dark:text-gray-200">{docTitle}</span>
                </nav>
                <button onClick={onClose} className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                    {t('docView.backToList')}
                </button>
            </header>

            <div className="flex flex-col lg:flex-row gap-8">
                <aside className="lg:w-1/4 order-2 lg:order-1">
                    <div className="sticky top-8 p-4 bg-slate-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-lg">
                        <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-3">{t('docView.tableOfContents')}</h3>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#intro" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">{t('docView.content.toc.intro')}</a></li>
                            <li><a href="#section1" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">{t('docView.content.toc.s1')}</a></li>
                            <li><a href="#section2" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">{t('docView.content.toc.s2')}</a></li>
                            <li><a href="#section3" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">{t('docView.content.toc.s3')}</a></li>
                            <li><a href="#appendix" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">{t('docView.content.toc.appendix')}</a></li>
                        </ul>
                         {currentUserRole === 'admin' && (
                            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                {!isEditingContent ? (
                                    <button onClick={() => setIsEditingContent(true)} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-semibold">
                                        {t('docView.editContent')}
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button onClick={() => setIsEditingContent(false)} className="w-full px-4 py-2 rounded-md text-gray-600 dark:text-gray-300 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 transition-colors text-sm">{t('common.cancel')}</button>
                                        <button onClick={handleSaveContent} className="w-full px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors text-sm">{t('common.save')}</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </aside>
                <main className="lg:w-3/4 order-1 lg:order-2">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{docTitle}</h1>
                    <div className="flex flex-wrap items-center gap-2 mb-6">
                        <p className="text-sm text-gray-500 dark:text-gray-500 font-mono">{t('docView.lastUpdated')}: {formatRelativeTime(doc.updatedAt, lang, t)}</p>
                        <div className="flex flex-wrap gap-2">
                             {doc.tags.map(tag => (
                                <div key={tag} className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-md">
                                    <Icon name="tag" className="w-3 h-3"/> {tag}
                                </div>
                            ))}
                        </div>
                    </div>

                    { isEditingContent ? (
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-500/50">
                            <EditableField label={t('docView.content.toc.intro')} value={editableContent.intro || ''} onChange={val => setEditableContent(p => ({...p, intro: val}))} multiline />
                            <EditableField label={t('docView.content.toc.s1')} value={editableContent.section1Title || ''} onChange={val => setEditableContent(p => ({...p, section1Title: val}))} />
                            <EditableField label={`${t('docView.content.toc.s1')} Body`} value={editableContent.section1Body || ''} onChange={val => setEditableContent(p => ({...p, section1Body: val}))} multiline />
                            <EditableField label={`${t('docView.content.toc.s1')} List`} value={editableContent.section1List || ''} onChange={val => setEditableContent(p => ({...p, section1List: val}))} multiline rows={3} />
                             <EditableField label={t('docView.content.toc.s2')} value={editableContent.section2Title || ''} onChange={val => setEditableContent(p => ({...p, section2Title: val}))} />
                            <EditableField label={`${t('docView.content.toc.s2')} Body`} value={editableContent.section2Body || ''} onChange={val => setEditableContent(p => ({...p, section2Body: val}))} multiline />
                             <EditableField label={t('docView.content.importantNoteLabel')} value={editableContent.importantNote || ''} onChange={val => setEditableContent(p => ({...p, importantNote: val}))} multiline />
                            <EditableField label={t('docView.content.toc.s3')} value={editableContent.section3Title || ''} onChange={val => setEditableContent(p => ({...p, section3Title: val}))} />
                            <EditableField label={`${t('docView.content.toc.s3')} Body`} value={editableContent.section3Body || ''} onChange={val => setEditableContent(p => ({...p, section3Body: val}))} multiline />
                        </div>
                    ) : (
                        <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                            <p id="intro">{currentContent.intro}</p>
                            <h3 id="section1">{currentContent.section1Title}</h3>
                            <p>{currentContent.section1Body}</p>
                            <ul className="list-disc pl-5 space-y-1">
                                {(currentContent.section1List || '').split('\n').map((item, i) => item && <li key={i}>{item}</li>)}
                            </ul>
                            <h3 id="section2">{currentContent.section2Title}</h3>
                            <p>{currentContent.section2Body}</p>
                            {currentContent.importantNote && <blockquote><p><strong>{currentContent.importantNote}</strong></p></blockquote>}
                            <h3 id="section3">{currentContent.section3Title}</h3>
                            <p>{currentContent.section3Body}</p>
                        </div>
                    )}


                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">{t('docView.downloadFiles')}</h4>
                        <div className="flex items-center gap-4 flex-wrap">
                            <DownloadButton ref={coBrowseRef} icon="pdf" text={t('docView.downloadPdf')} onClick={() => handleDownload('pdf')} status={downloadStatuses.pdf} />
                            {currentUserRole === 'admin' && <UploadButton text={t('docView.uploadNewPdf')} onFileSelect={() => handleFileUpload('pdf')} status={uploadStatuses.pdf} />}
                        </div>
                        <div className="flex items-center gap-4 flex-wrap mt-4">
                            <DownloadButton icon="dwg" text={t('docView.downloadDwg')} onClick={() => handleDownload('dwg')} status={downloadStatuses.dwg} />
                            {currentUserRole === 'admin' && <UploadButton text={t('docView.uploadNewDwg')} onFileSelect={() => handleFileUpload('dwg')} status={uploadStatuses.dwg} />}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};


// --- Main App Component ---

const App: React.FC = () => {
  const { t, lang } = useI18n();
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCoBrowsingActive, setIsCoBrowsingActive] = useState(false);
  const [agentCursorPosition, setAgentCursorPosition] = useState({ top: -100, left: -100 });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('guest');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginContext, setLoginContext] = useState<'view' | 'download' | 'login'>('login');

  const [editingDoc, setEditingDoc] = useState<Partial<Document> | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const docListRefs = useRef(documents.map(() => createRef<HTMLDivElement>()));
  const docViewCoBrowseRef = useRef<HTMLButtonElement>(null);

  const visibleCategories = useMemo(() => {
    return CATEGORIES.filter(cat => cat.viewPermissions.includes(currentUserRole));
  }, [currentUserRole]);
  
  const visibleCategoryKeys = useMemo(() => new Set(visibleCategories.map(c => c.nameKey)), [visibleCategories]);
  
  const visibleDocuments = useMemo(() => {
      return documents.filter(doc => visibleCategoryKeys.has(doc.categoryKey));
  }, [documents, visibleCategoryKeys]);

  const allTags = useMemo(() => {
      const tags = new Set<string>();
      visibleDocuments.forEach(doc => {
          doc.tags.forEach(tag => tags.add(tag));
      });
      return Array.from(tags).sort();
  }, [visibleDocuments]);

  const filteredDocs = useMemo(() => {
    let docs = visibleDocuments;

    if (selectedCategory) {
      docs = docs.filter(doc => doc.categoryKey === selectedCategory);
    }

    if (selectedTags.size > 0) {
      docs = docs.filter(doc => doc.tags.some(tag => selectedTags.has(tag)));
    }

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      docs = docs.filter(doc => {
        const title = doc.titleKey ? t(doc.titleKey) : doc.title;
        return title?.toLowerCase().includes(lowerSearchTerm) ||
        t(doc.categoryKey).toLowerCase().includes(lowerSearchTerm) ||
        doc.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm));
      });
    }
    return docs;
  }, [searchTerm, visibleDocuments, selectedCategory, selectedTags, t]);
  
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t('title');
  }, [lang, t]);


  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    let timer: number;
    if (isCoBrowsingActive) {
      let targetElement: HTMLElement | null = null;
      
      if (selectedDoc && docViewCoBrowseRef.current) {
        targetElement = docViewCoBrowseRef.current;
      } else if (!selectedDoc && docListRefs.current[0]?.current) {
        targetElement = docListRefs.current[0].current;
      }

      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        setAgentCursorPosition({
          top: rect.top + window.scrollY + (rect.height / 2) - 12,
          left: rect.left + window.scrollX + 20,
        });

        timer = window.setTimeout(() => {
          setIsCoBrowsingActive(false);
          setAgentCursorPosition({ top: -100, left: -100 });
        }, 5000);
      }
    }
    return () => clearTimeout(timer);
  }, [isCoBrowsingActive, selectedDoc]);

  const handleStartCoBrowse = () => {
    setIsCoBrowsingActive(true);
    setIsChatOpen(false);
  };
  
  const handleSelectDoc = (doc: Document) => {
    const permissions = categoryPermissions.get(doc.categoryKey) || [];
    if (!permissions.includes(currentUserRole)) {
        setLoginContext('view');
        setIsLoginModalOpen(true);
        return;
    }

    setSelectedDoc(doc);
    window.scrollTo(0, 0);
  };
  
  const handleCloseDoc = () => {
    setSelectedDoc(null);
  };
  
  const handleRequireLogin = () => {
      setLoginContext('download');
      setIsLoginModalOpen(true);
  };

  const handleLogin = (role: UserRole) => {
    setCurrentUserRole(role);
    setIsLoginModalOpen(false);
    setSelectedTags(new Set()); // Reset tags on role change
  };

  const handleLogout = () => {
    if (selectedDoc && !categoryPermissions.get(selectedDoc.categoryKey)?.includes('guest')) {
      setSelectedDoc(null);
    }
    if (selectedCategory && !CATEGORIES.find(c => c.nameKey === selectedCategory)?.viewPermissions.includes('guest')) {
      setSelectedCategory(null);
    }
    setCurrentUserRole('guest');
    setSelectedTags(new Set());
  };

  const handleSaveDocument = (docToSave: Partial<Document>) => {
    const exists = documents.some(d => d.id === docToSave.id);
    if (exists) {
        setDocuments(documents.map(d => d.id === docToSave.id ? { ...d, ...docToSave, updatedAt: new Date() } as Document : d));
    } else {
        const newDoc: Document = {
            id: `doc${Date.now()}`,
            title: docToSave.title,
            categoryKey: docToSave.categoryKey!,
            updatedAt: new Date(),
            tags: docToSave.tags || [],
            content: {
                en: { ...emptyContentTemplate },
                uk: { ...emptyContentTemplate },
            }
        };
        setDocuments([newDoc, ...documents]);
    }
    setEditingDoc(null);
  };
  
  const handleUpdateDocumentContent = (docId: string, lang: Language, newContent: DocumentContent) => {
      setDocuments(prevDocs => prevDocs.map(doc => {
          if (doc.id === docId) {
              const updatedDoc = {
                  ...doc,
                  updatedAt: new Date(),
                  content: {
                      ...doc.content,
                      [lang]: newContent,
                  }
              };
              // if we are on the page of the selected doc, update it
              if(selectedDoc?.id === docId) {
                  setSelectedDoc(updatedDoc);
              }
              return updatedDoc;
          }
          return doc;
      }));
  };

  const handleDeleteDocument = (id: string) => {
    if (window.confirm(t('dashboard.confirmDelete'))) {
        setDocuments(documents.filter(d => d.id !== id));
    }
  };
  
  const handleCategorySelect = (categoryKey: string) => {
    setSelectedCategory(prev => (prev === categoryKey ? null : categoryKey));
  };
  
  const handleTagSelect = (tagName: string) => {
      if (tagName === '') { 
          setSelectedTags(new Set());
          setSelectedCategory(null);
          return;
      }
    setSelectedTags(prev => {
      const newTags = new Set(prev);
      if (newTags.has(tagName)) {
        newTags.delete(tagName);
      } else {
        newTags.add(tagName);
      }
      return newTags;
    });
  };

  const showAdminControls = currentUserRole === 'admin';


  return (
    <div className={`min-h-screen bg-slate-50 text-slate-800 dark:bg-gray-900 dark:text-gray-200 font-sans antialiased transition-colors duration-300 ${showAdminControls ? 'outline outline-4 outline-offset-[-4px] outline-blue-500' : ''}`}>
      <header className="absolute top-0 left-0 right-0 p-4 z-50 flex justify-between items-center">
          <UserAccessControl 
              role={currentUserRole}
              onLoginClick={() => { setLoginContext('login'); setIsLoginModalOpen(true); }}
              onLogout={handleLogout}
          />
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <ThemeSwitcher theme={theme} toggleTheme={toggleTheme} />
          </div>
      </header>

      <div className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 relative">
        {selectedDoc ? (
          <DocumentView 
            doc={selectedDoc} 
            onClose={handleCloseDoc} 
            coBrowseRef={docViewCoBrowseRef}
            onRequireLogin={handleRequireLogin}
            currentUserRole={currentUserRole}
            onUpdateContent={handleUpdateDocumentContent}
          />
        ) : (
          <DashboardView 
            onSelectDoc={handleSelectDoc} 
            docRefs={docListRefs.current}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filteredDocs={filteredDocs}
            showAdminControls={showAdminControls}
            onEditDoc={(doc) => setEditingDoc(doc)}
            onDeleteDoc={handleDeleteDocument}
            onAddNewDoc={() => setEditingDoc({})}
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
            visibleCategories={visibleCategories}
            allTags={allTags}
            selectedTags={selectedTags}
            onTagSelect={handleTagSelect}
          />
        )}
        
        <footer className="mt-16 text-center text-gray-500 dark:text-gray-600 font-mono text-sm">
            <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
        </footer>
      </div>
      
      {isLoginModalOpen && <LoginModal onLogin={handleLogin} onClose={() => setIsLoginModalOpen(false)} context={loginContext} />}
      
      {editingDoc !== null && (
          <DocumentEditorModal 
              doc={editingDoc}
              onSave={handleSaveDocument}
              onClose={() => setEditingDoc(null)}
              availableCategories={visibleCategories}
          />
      )}

      {/* Chat & Co-Browsing Visualization */}
      {currentUserRole === 'guest' && (
        <>
            {isCoBrowsingActive && <AgentCursor position={agentCursorPosition} />}
            {isChatOpen && <InteractiveChatWindow onClose={() => setIsChatOpen(false)} onStartCoBrowse={handleStartCoBrowse} />}
            <button 
                className="fixed bottom-6 right-6 bg-blue-600 p-3 rounded-full shadow-xl cursor-pointer hover:bg-blue-700 transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 z-30" 
                onClick={() => setIsChatOpen(!isChatOpen)} 
                aria-label={t('chat.title')}
            >
                <Icon name="chat-bubble-left-right" className="w-7 h-7 text-white" />
            </button>
        </>
      )}


      <style>{`
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default App;