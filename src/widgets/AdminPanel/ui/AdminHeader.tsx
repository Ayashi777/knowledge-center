import React from 'react';
import { Icon } from '@shared/ui/icons';

interface AdminHeaderProps {
    onClose: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onClose }) => {
    return (
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
            <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                    Панель керування
                </h2>
                <p className="text-sm text-gray-500 font-medium italic">Адміністрування контенту та користувачів</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                <Icon name="x-mark" className="w-6 h-6" />
            </button>
        </div>
    );
};
