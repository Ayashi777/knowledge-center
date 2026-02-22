import React from 'react';
import { Icon } from '@shared/ui/icons';
import { Button } from '@shared/ui/primitives';

interface AdminHeaderProps {
    onClose: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onClose }) => {
    return (
        <div className="flex items-center justify-between border-b border-border p-6">
            <div>
                <h2 className="text-2xl font-black uppercase tracking-tighter text-fg">
                    Панель керування
                </h2>
                <p className="text-sm font-medium italic text-muted-fg">Адміністрування контенту та користувачів</p>
            </div>
            <Button onClick={onClose} variant="ghost" size="icon" className="text-muted-fg">
                <Icon name="x-mark" className="w-6 h-6" />
            </Button>
        </div>
    );
};
