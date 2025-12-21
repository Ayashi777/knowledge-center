import React from 'react';
import { Icon } from '../../../../shared/ui/icons';

type TabId = 'content' | 'users' | 'tags';

interface AdminTabsProps {
    activeTab: TabId;
    setActiveTab: (id: TabId) => void;
}

export const AdminTabs: React.FC<AdminTabsProps> = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { id: 'content', label: 'Контент', icon: 'document-text' },
        { id: 'tags', label: 'Теги', icon: 'tag' },
        { id: 'users', label: 'Користувачі', icon: 'users' },
    ] as const;

    return (
        <div className="flex border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-8 py-4 text-sm font-black uppercase tracking-widest transition-all relative ${
                        activeTab === tab.id
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                    }`}
                >
                    <Icon name={tab.icon} className="w-4 h-4" />
                    {tab.label}
                    {activeTab === tab.id && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />
                    )}
                </button>
            ))}
        </div>
    );
};
