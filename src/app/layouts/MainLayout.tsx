import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useI18n } from '@app/providers/i18n/i18n';
import { useAuth } from '@app/providers/AuthProvider';
import { useTheme } from '@shared/hooks/useTheme';
import { ThemeSwitcher } from '@shared/ui/ThemeSwitcher';
import { UserAccessControl } from '@shared/ui/UserAccessControl';
import { Icon } from '@shared/ui/icons';
import { SupportSidebar } from '@widgets/SupportSidebar/ui/SupportSidebar';

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
    const showAdminControls = role === 'admin';

    const navItems = [
        { label: t('header.nav.home'), path: '/', icon: 'home' },
        { label: t('header.nav.database'), path: '/database', icon: 'storage' },
        { label: t('header.nav.services'), path: '/services', icon: 'engineering' },
    ];

    const mobileTabs = [
        { label: t('header.nav.home'), path: '/', icon: 'home' },
        { label: t('header.nav.database'), path: '/database', icon: 'storage' },
        { label: t('header.nav.services'), path: '/services', icon: 'engineering' },
        ...(showAdminControls ? [{ label: t('header.nav.admin') || 'Admin', path: '/admin', icon: 'cog' }] : []),
    ];

    const getMobileTitle = () => {
        if (location.pathname.startsWith('/admin')) return t('header.nav.admin') || 'Admin';
        if (location.pathname.startsWith('/services')) return t('header.nav.services');
        if (location.pathname.startsWith('/database')) return t('header.nav.database');
        return t('header.nav.home');
    };

    const handleNavClick = (path: string) => {
        navigate(path);
    };

    return (
        <div className={`min-h-screen bg-slate-50 text-slate-800 dark:bg-gray-900 dark:text-gray-200 font-sans antialiased transition-colors duration-300 ${
            showAdminControls ? 'outline outline-4 outline-offset-[-4px] outline-blue-500/5' : ''
        }`}>
            <header className="fixed top-0 left-0 right-0 p-4 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
                <div className="hidden md:flex justify-between items-center">
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
                    </div>
                </div>

                {/* Mobile App Bar */}
                <div className="flex md:hidden items-center justify-between">
                    <button
                        onClick={() => (location.pathname === '/' ? navigate('/') : navigate(-1))}
                        className="p-2 text-gray-600 dark:text-gray-300"
                        aria-label="Back"
                    >
                        <Icon name="chevron-left" className="w-6 h-6" />
                    </button>

                    <div className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">
                        {getMobileTitle()}
                    </div>

                    <div className="flex items-center gap-2">
                        <UserAccessControl
                            user={user}
                            role={role}
                            onLoginClick={onLoginClick}
                        />
                        <ThemeSwitcher theme={theme} toggleTheme={toggleTheme} />
                    </div>
                </div>
            </header>

            <main className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 relative min-h-screen pt-20 md:pt-24 pb-24 md:pb-8">
                {children}
            </main>

            <SupportSidebar />

            {/* Mobile Tab Bar */}
            <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 md:hidden">
                <div className={`grid ${mobileTabs.length === 4 ? 'grid-cols-4' : 'grid-cols-3'} gap-2 px-4 py-3`}>
                    {mobileTabs.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => handleNavClick(item.path)}
                            className={`flex items-center justify-center gap-2 rounded-xl py-2 text-[11px] font-black uppercase tracking-widest ${
                                location.pathname === item.path
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-500 dark:text-gray-400'
                            }`}
                        >
                            <Icon name={item.icon as any} className="w-4 h-4" />
                            {item.label}
                        </button>
                    ))}
                </div>
            </nav>

            <footer className="mt-20 text-center text-gray-400 dark:text-gray-600 font-mono text-[9px] uppercase tracking-widest pb-12">
                <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
            </footer>
        </div>
    );
};
