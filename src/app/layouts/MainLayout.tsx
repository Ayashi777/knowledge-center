import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@app/providers/i18n/i18n';
import { useAuth } from '@app/providers/AuthProvider';
import { useTheme } from '@shared/hooks/useTheme';
import { ThemeSwitcher } from '@shared/ui/ThemeSwitcher';
import { LanguageSwitcher } from '@shared/ui/LanguageSwitcher';
import { UserAccessControl } from '@shared/ui/UserAccessControl';

interface LayoutProps {
    children: React.ReactNode;
    onLoginClick: () => void;
}

export const MainLayout: React.FC<LayoutProps> = ({ children, onLoginClick }) => {
    const { t } = useI18n();
    const navigate = useNavigate();
    const { user, role } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const showAdminControls = role === 'admin';

    return (
        <div className={`min-h-screen bg-slate-50 text-slate-800 dark:bg-gray-900 dark:text-gray-200 font-sans antialiased transition-colors duration-300 ${
            showAdminControls ? 'outline outline-4 outline-offset-[-4px] outline-blue-500/5' : ''
        }`}>
            <header className="fixed top-0 left-0 right-0 p-4 z-20 flex justify-between items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/')}
                        className="text-lg font-black tracking-tighter text-gray-900 dark:text-white flex items-center gap-2"
                    >
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs">CE</div>
                        <span className="hidden sm:block">ЦЕНТР ЗНАНЬ</span>
                    </button>
                </div>

                <div className="flex items-center gap-6">
                    <LanguageSwitcher />
                    <UserAccessControl
                        user={user}
                        role={role}
                        onLoginClick={onLoginClick}
                    />
                    <ThemeSwitcher theme={theme} toggleTheme={toggleTheme} />
                </div>
            </header>

            <main className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 relative min-h-screen pt-24">
                {children}
            </main>

            <footer className="mt-20 text-center text-gray-400 dark:text-gray-600 font-mono text-[9px] uppercase tracking-widest pb-12">
                <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
            </footer>
        </div>
    );
};
