import React from 'react';
import { Icon } from '@shared/ui/icons';
import { Button } from '@shared/ui/primitives';

interface AdminHeaderProps {
    onClose: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onClose }) => {
    return (
        <div className="flex flex-col gap-4 border-b border-border bg-surface px-6 py-5 md:flex-row md:items-center md:justify-between">
            <div>
                <h2 className="text-2xl font-black tracking-tight text-fg">Адмін-панель</h2>
                <p className="text-sm font-medium text-muted-fg">Керування контентом, тегами, користувачами та заявками</p>
            </div>
            <Button onClick={onClose} variant="outline" className="w-full md:w-auto">
                <Icon name="home" className="w-4 h-4" />
                До сайту
            </Button>
        </div>
    );
};
