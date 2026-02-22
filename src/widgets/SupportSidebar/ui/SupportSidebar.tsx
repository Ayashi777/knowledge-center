import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Icon } from '@shared/ui/icons';
import { useI18n } from '@app/providers/i18n/i18n';
import { Button } from '@shared/ui/primitives';

export const SupportSidebar: React.FC = () => {
    const { t } = useI18n();
    const location = useLocation();
    
    // Expanded state (full panel)
    const [isExpanded, setIsExpanded] = useState(false);
    // Initial hint/tooltip state
    const [showHint, setShowHint] = useState(false);
    
    // Refs for tracking and DOM access
    const containerRef = useRef<HTMLDivElement>(null);
    const isHovered = useRef(false);
    const lastScrollY = useRef(0);
    const hasAutoOpenedInZone = useRef(false);
    const collapseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const isLandingPage = location.pathname === '/';

    const collapse = useCallback(() => {
        setIsExpanded(false);
        setShowHint(false);
    }, []);

    // Logic for auto-opening/closing based on scroll position
    const checkScrollTriggers = useCallback(() => {
        if (!isLandingPage) return;

        const startElem = document.getElementById('for-whom-section');
        const endElem = document.getElementById('tech-team-section');

        if (!startElem || !endElem) return;

        const scrollY = window.scrollY;
        const zoneStart = startElem.offsetTop - 300;
        const zoneEnd = endElem.offsetTop - 200;

        const inZone = scrollY >= zoneStart && scrollY <= zoneEnd;

        // Auto-open on first entry to zone
        if (inZone && !hasAutoOpenedInZone.current) {
            setIsExpanded(true);
            setShowHint(true);
            hasAutoOpenedInZone.current = true;
        } 
        
        // Auto-collapse when leaving zone
        if (!inZone && hasAutoOpenedInZone.current && !isHovered.current) {
            collapse();
            hasAutoOpenedInZone.current = false; 
        }
    }, [isLandingPage, collapse]);

    useEffect(() => {
        if (!isLandingPage) return;

        const handleScroll = () => {
            checkScrollTriggers();

            const currentScrollY = window.scrollY;
            const diff = Math.abs(currentScrollY - lastScrollY.current);

            // Collapse on significant scroll if not being interacted with
            if (diff > 80 && isExpanded && !isHovered.current) {
                collapse();
            }

            lastScrollY.current = currentScrollY;
        };

        // Click outside listener
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                if (isExpanded) {
                    collapse();
                    // If user manually closes by clicking away, we prevent auto-reopen in this zone visit
                    hasAutoOpenedInZone.current = true;
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        document.addEventListener('mousedown', handleClickOutside);
        
        checkScrollTriggers();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isLandingPage, isExpanded, checkScrollTriggers, collapse]);

    const handleMouseEnter = () => {
        if (collapseTimeoutRef.current) clearTimeout(collapseTimeoutRef.current);
        isHovered.current = true;
        setIsExpanded(true);
        setShowHint(false);
    };

    const handleMouseLeave = () => {
        isHovered.current = false;
        // Auto-collapse after delay when mouse leaves
        collapseTimeoutRef.current = setTimeout(() => {
            if (!isHovered.current) {
                collapse();
            }
        }, 2500);
    };

    if (!isLandingPage) return null;

    return (
        <div 
            ref={containerRef}
            className={`fixed right-0 top-1/2 -translate-y-1/2 z-50 flex items-center transition-all duration-500 ease-out ${
                isExpanded ? 'translate-x-0' : 'translate-x-[calc(100%-16px)]'
            }`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Tooltip Hint */}
            {showHint && !isExpanded && (
                <div className="absolute right-20 w-64 origin-right animate-bounce-in rounded-2xl border border-border bg-surface p-4 shadow-soft">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                            {t('support.hint_title')}
                        </span>
                    </div>
                    <p className="text-sm font-bold leading-tight text-fg">
                        {t('support.context.home')}
                    </p>
                    <div className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rotate-45 border-r border-t border-border bg-surface" />
                </div>
            )}

            {/* Permanent Sidebar Tab (Handle) */}
            <button
                type="button"
                aria-label={t('support.panel_title')}
                className={`group flex h-48 w-16 cursor-pointer flex-col items-center justify-center rounded-l-[2.5rem] bg-primary shadow-soft transition-all duration-500 hover:w-20 ${
                    isExpanded ? 'opacity-0 pointer-events-none translate-x-10' : 'opacity-100 translate-x-0'
                }`}
                onFocus={handleMouseEnter}
                onBlur={handleMouseLeave}
            >
                <div className="rotate-90 whitespace-nowrap flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-fg transition-all group-hover:tracking-[0.5em]">
                        SUPPORT
                    </span>
                    <Icon name="chevron-left" className="h-4 w-4 animate-pulse text-primary-fg" />
                </div>
                <div className="absolute right-4 top-6 h-2 w-2 rounded-full border border-primary-fg bg-danger shadow-sm" />
            </button>

            {/* Expanded Content Panel */}
            <div 
                className={`w-80 rounded-l-[3.5rem] border-y border-l border-border bg-surface shadow-soft transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${
                    isExpanded 
                        ? 'translate-x-0 opacity-100 scale-100' 
                        : 'translate-x-full opacity-0 scale-95 pointer-events-none'
                }`}
            >
                <div className="p-10 flex flex-col min-h-[460px]">
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex h-16 w-16 -rotate-6 items-center justify-center rounded-2xl bg-primary text-primary-fg shadow-soft">
                                <Icon name="chat-bubble-left-right" className="w-8 h-8" />
                            </div>
                            <div className="text-right">
                                <div className="flex items-center justify-end gap-2 mb-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-success">Active</span>
                                    <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-success shadow-[0_0_8px_hsl(var(--success)/0.6)]" />
                                </div>
                                <p className="text-[9px] font-bold uppercase text-muted-fg">Support Dept</p>
                            </div>
                        </div>
                        
                        <h3 className="mb-3 text-3xl font-black leading-none tracking-tighter text-fg">
                            {t('support.panel_title')}
                        </h3>
                        <p className="mb-10 text-sm font-bold leading-relaxed text-muted-fg">
                            {t('support.context.home')}
                        </p>

                        <div className="space-y-5">
                            <a
                                href="https://t.me/your_telegram_handle"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group/item flex items-center gap-6 rounded-[2.5rem] bg-muted/40 p-5 text-fg shadow-sm transition-all hover:bg-primary hover:text-primary-fg hover:shadow-soft"
                            >
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface shadow-md transition-all group-hover/item:scale-110">
                                    <Icon name="paper-plane" className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="font-black text-sm uppercase tracking-tight">Telegram Chat</p>
                                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Відповідь за 5 хв</p>
                                </div>
                            </a>
                            
                            <Button
                                onClick={() => {/* Callback Link */}}
                                variant="ghost"
                                className="group/item h-auto w-full justify-start gap-6 rounded-[2.5rem] bg-muted/40 p-5 text-left text-fg shadow-sm transition-all hover:bg-success hover:text-white hover:shadow-soft"
                            >
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface shadow-md transition-all group-hover/item:scale-110">
                                    <Icon name="phone" className="h-6 w-6 text-success" />
                                </div>
                                <div>
                                    <p className="font-black text-sm uppercase tracking-tight">{t('support.callback')}</p>
                                    <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">Зателефонуємо зараз</p>
                                </div>
                            </Button>
                        </div>
                    </div>

                    <div className="mt-10 flex items-center justify-between border-t border-border pt-8 opacity-50">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-fg">Knowledge Center</span>
                        <span className="text-[10px] font-bold uppercase text-muted-fg">09:00 - 18:00</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
