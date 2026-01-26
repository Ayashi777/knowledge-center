import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useI18n } from '@app/providers/i18n/i18n';
import { useAuth } from '@app/providers/AuthProvider';
import { useTheme } from '@shared/hooks/useTheme';
import { ThemeSwitcher } from '@shared/ui/ThemeSwitcher';
import { UserAccessControl } from '@shared/ui/UserAccessControl';
import { Icon } from '@shared/ui/icons';

interface LayoutProps {
    children: React.ReactNode;
    onLoginClick: () => void;
}

export const MainLayout: React.FC<LayoutProps> = ({ children, onLoginClick }) => {
    const { t } = useI18n();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, role } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const showAdminControls = role === 'admin';

    const navItems = [
        { label: t('header.nav.home'), path: '/', icon: 'home' },
        { label: t('header.nav.database'), path: '/database', icon: 'storage' },
        { label: t('header.nav.services'), path: '/services', icon: 'engineering' },
    ];

    const handleNavClick = (path: string) => {
        navigate(path);
        setIsMobileMenuOpen(false);
    };

    return (
        <div className={`min-h-screen bg-slate-50 text-slate-800 dark:bg-gray-900 dark:text-gray-200 font-sans antialiased transition-colors duration-300 ${
            showAdminControls ? 'outline outline-4 outline-offset-[-4px] outline-blue-500/5' : ''
        }`}>
            <header className="fixed top-0 left-0 right-0 p-4 z-40 flex justify-between items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-8">
                    <button
                        onClick={() => navigate('/')}
                        className="text-lg font-black tracking-tighter text-gray-900 dark:text-white flex items-center gap-2"
                    >
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs">CE</div>
                        <span className="hidden lg:block uppercase">ЦЕНТР ЗНАНЬ</span>
                    </button>

                    <nav className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => (
                            <button
                                key={item.path}
                                onClick={() => handleNavClick(item.path)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                                    location.pathname === item.path
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                            >
                                <Icon name={item.icon as any} className="w-4 h-4" />
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-3 sm:gap-6">
                    <div className="flex items-center gap-2">
                        <UserAccessControl
                            user={user}
                            role={role}
                            onLoginClick={onLoginClick}
                        />
                        <ThemeSwitcher theme={theme} toggleTheme={toggleTheme} />
                    </div>

                    <button 
                        className="md:hidden p-2 text-gray-600 dark:text-gray-300"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <Icon name={isMobileMenuOpen ? 'close' : 'menu'} className="w-6 h-6" />
                    </button>
                </div>
            </header>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-30 bg-white dark:bg-gray-900 pt-24 px-6 md:hidden animate-fade-in">
                    <nav className="flex flex-col gap-4">
                        {navItems.map((item) => (
                            <button
                                key={item.path}
                                onClick={() => handleNavClick(item.path)}
                                className={`p-4 rounded-2xl text-left text-xl font-bold flex items-center gap-4 ${
                                    location.pathname === item.path
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white'
                                }`}
                            >
                                <Icon name={item.icon as any} className="w-6 h-6" />
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>
            )}

            <main className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 relative min-h-screen pt-24">
                {children}
            </main>

            <footer className="mt-20 text-center text-gray-400 dark:text-gray-600 font-mono text-[9px] uppercase tracking-widest pb-12">
                <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
            </footer>
        </div>
    );
};
