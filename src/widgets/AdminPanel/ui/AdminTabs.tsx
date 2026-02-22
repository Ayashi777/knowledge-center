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
    <div className="flex gap-2 overflow-x-auto border-b border-border bg-muted/20 p-3 md:flex-col md:overflow-visible md:border-b-0 md:bg-transparent md:p-4">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          variant="ghost"
          className={`h-auto shrink-0 justify-start px-3 py-3 text-xs font-black uppercase tracking-wider md:w-full md:text-sm ${
            activeTab === tab.id
              ? 'bg-primary text-white hover:bg-primary hover:text-white dark:text-black dark:hover:text-black'
              : 'text-fg/85 hover:bg-muted hover:text-fg'
          }`}
        >
          <Icon name={tab.icon as any} className="h-4 w-4 shrink-0" />
          <span className="truncate">{tab.label}</span>
          {tab.id === 'requests' && pendingRequestsCount > 0 && (
            <span className="ml-auto rounded-full bg-danger px-2 py-0.5 text-[10px] text-white">
              {pendingRequestsCount}
            </span>
          )}
          {tab.id === 'health' && healthIssuesCount > 0 && (
            <span className="ml-auto rounded-full bg-warning px-2 py-0.5 text-[10px] text-black">
              {healthIssuesCount}
            </span>
          )}
        </Button>
      ))}
    </div>
  );
};
