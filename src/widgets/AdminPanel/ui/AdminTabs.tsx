import React from 'react';
import { Icon } from '@shared/ui/icons';
import { Button } from '@shared/ui/primitives';

type TabId = 'content' | 'users' | 'tags' | 'requests' | 'health';

interface AdminTabsProps {
    activeTab: TabId;
    setActiveTab: (id: TabId) => void;
    pendingRequestsCount?: number;
    healthIssuesCount?: number;
}

export const AdminTabs: React.FC<AdminTabsProps> = ({ activeTab, setActiveTab, pendingRequestsCount = 0, healthIssuesCount = 0 }) => {
    const tabs = [
        { id: 'content', label: 'Контент', icon: 'document-text' },
        { id: 'health', label: 'Health', icon: 'warning' },
        { id: 'tags', label: 'Теги', icon: 'tag' },
        { id: 'users', label: 'Користувачі', icon: 'users' },
        { id: 'requests', label: 'Заявки', icon: 'info-circle' },
    ] as const;

    return (
        <div className="flex border-b border-border bg-muted/30">
            {tabs.map((tab) => (
                <Button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    variant="ghost"
                    className={`relative h-auto rounded-none px-8 py-4 text-sm font-black uppercase tracking-widest transition-all ${
                        activeTab === tab.id
                            ? 'text-primary'
                            : 'text-muted-fg hover:text-fg'
                    }`}
                >
                    <Icon name={tab.icon as any} className="w-4 h-4" />
                    {tab.label}
                    {tab.id === 'requests' && pendingRequestsCount > 0 && (
                        <span className="ml-2 rounded-full bg-danger px-2 py-0.5 text-[10px] text-white animate-pulse">
                            {pendingRequestsCount}
                        </span>
                    )}
                    {tab.id === 'health' && healthIssuesCount > 0 && (
                        <span className="ml-2 rounded-full bg-warning px-2 py-0.5 text-[10px] text-black">
                            {healthIssuesCount}
                        </span>
                    )}
                    {activeTab === tab.id && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full bg-primary" />
                    )}
                </Button>
            ))}
        </div>
    );
};
