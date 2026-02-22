import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useI18n } from '@app/providers/i18n/i18n';
import { useAuth } from '@app/providers/AuthProvider';
import { useTheme } from '@shared/hooks/useTheme';
import { ThemeSwitcher } from '@shared/ui/ThemeSwitcher';
import { UserAccessControl } from '@shared/ui/UserAccessControl';
import { Icon } from '@shared/ui/icons';
import { Button, Card } from '@shared/ui/primitives';
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
    const isAdminRoute = location.pathname.startsWith('/admin');

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
        <div className={`min-h-screen bg-bg text-fg font-body antialiased transition-colors duration-300 ${
            showAdminControls ? 'outline outline-4 outline-offset-[-4px] outline-primary/20' : ''
        }`}>
            <header className="fixed top-0 left-0 right-0 z-40 border-b border-border bg-bg/90 p-4 backdrop-blur-xl">
                <div className="hidden md:flex justify-between items-center">
                    <div className="flex items-center gap-8">
                        <Button
                            onClick={() => navigate('/')}
                            variant="ghost"
                            className="h-auto px-0 text-lg font-black tracking-tighter text-fg hover:bg-transparent"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-heading text-primary-fg">CE</div>
                            <span className="hidden lg:block uppercase">ЦЕНТР ЗНАНЬ</span>
                        </Button>

                        <nav className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => (
                                <Button
                                    key={item.path}
                                    onClick={() => handleNavClick(item.path)}
                                    variant={location.pathname === item.path ? 'primary' : 'ghost'}
                                    className={`rounded-xl font-bold transition-all ${
                                        location.pathname === item.path
                                            ? ''
                                            : 'text-muted-fg'
                                    }`}
                                >
                                    <Icon name={item.icon as any} className="w-4 h-4" />
                                    {item.label}
                                </Button>
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
                    <Button
                        onClick={() => (location.pathname === '/' ? navigate('/') : navigate(-1))}
                        variant="ghost"
                        size="icon"
                        className="text-muted-fg"
                        aria-label="Back"
                    >
                        <Icon name="chevron-left" className="w-6 h-6" />
                    </Button>

                    <div className="font-heading text-sm font-black uppercase tracking-widest text-fg">
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

            <main className={`relative min-h-screen ${
                isAdminRoute
                    ? 'w-full max-w-none px-0 pt-24 md:pt-28 pb-24 md:pb-8'
                    : 'container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 pt-20 md:pt-24 pb-24 md:pb-8'
            }`}>
                {children}
            </main>

            {!isAdminRoute && <SupportSidebar />}

            {/* Mobile Tab Bar */}
            {!isAdminRoute && (
            <Card className="fixed bottom-0 left-0 right-0 z-40 rounded-none border-x-0 border-b-0 bg-bg/90 backdrop-blur-xl md:hidden">
                <div className={`grid ${mobileTabs.length === 4 ? 'grid-cols-4' : 'grid-cols-3'} gap-2 px-4 py-3`}>
                    {mobileTabs.map((item) => (
                        <Button
                            key={item.path}
                            onClick={() => handleNavClick(item.path)}
                            variant={location.pathname === item.path ? 'primary' : 'ghost'}
                            className={`h-auto py-2 text-[11px] font-black uppercase tracking-widest ${
                                location.pathname === item.path
                                    ? ''
                                    : 'text-muted-fg'
                            }`}
                        >
                            <Icon name={item.icon as any} className="w-4 h-4" />
                            {item.label}
                        </Button>
                    ))}
                </div>
            </Card>
            )}

            {!isAdminRoute && (
            <footer className="mt-20 pb-12 text-center font-mono text-[9px] uppercase tracking-widest text-muted-fg">
                <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
            </footer>
            )}
        </div>
    );
};
