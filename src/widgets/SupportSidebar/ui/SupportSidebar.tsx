import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Icon } from '@shared/ui/icons';
import { useI18n } from '@app/providers/i18n/i18n';

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
                <div className="absolute right-20 bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-4 border border-blue-100 dark:border-gray-700 w-64 animate-bounce-in origin-right">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                            {t('support.hint_title')}
                        </span>
                    </div>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-tight">
                        {t('support.context.home')}
                    </p>
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-gray-800 border-r border-t border-blue-100 dark:border-gray-700 rotate-45" />
                </div>
            )}

            {/* Permanent Sidebar Tab (Handle) */}
            <div 
                className={`w-16 h-48 bg-blue-600 dark:bg-blue-500 rounded-l-[2.5rem] shadow-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-500 hover:w-20 group ${
                    isExpanded ? 'opacity-0 pointer-events-none translate-x-10' : 'opacity-100 translate-x-0'
                }`}
            >
                <div className="rotate-90 whitespace-nowrap flex items-center gap-4">
                    <span className="text-white font-black uppercase tracking-[0.4em] text-[10px] group-hover:tracking-[0.5em] transition-all">
                        SUPPORT
                    </span>
                    <Icon name="chevron-left" className="w-4 h-4 text-white animate-pulse" />
                </div>
                <div className="absolute top-6 right-4 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-900 shadow-sm" />
            </div>

            {/* Expanded Content Panel */}
            <div 
                className={`bg-white dark:bg-gray-900 border-l border-y border-gray-100 dark:border-gray-800 shadow-[0_0_60px_-15px_rgba(0,0,0,0.4)] w-80 rounded-l-[3.5rem] transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${
                    isExpanded 
                        ? 'translate-x-0 opacity-100 scale-100' 
                        : 'translate-x-full opacity-0 scale-95 pointer-events-none'
                }`}
            >
                <div className="p-10 flex flex-col min-h-[460px]">
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-10">
                            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/40 transform -rotate-6">
                                <Icon name="chat-bubble-left-right" className="w-8 h-8" />
                            </div>
                            <div className="text-right">
                                <div className="flex items-center justify-end gap-2 mb-1">
                                    <span className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest">Active</span>
                                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                </div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase">Support Dept</p>
                            </div>
                        </div>
                        
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-3 leading-none tracking-tighter">
                            {t('support.panel_title')}
                        </h3>
                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-10 leading-relaxed">
                            {t('support.context.home')}
                        </p>

                        <div className="space-y-5">
                            <a
                                href="https://t.me/your_telegram_handle"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-6 bg-slate-50 hover:bg-blue-600 dark:bg-gray-800 dark:hover:bg-blue-600 p-5 rounded-[2.5rem] transition-all group/item text-gray-900 dark:text-white hover:text-white shadow-sm hover:shadow-xl hover:shadow-blue-500/20"
                            >
                                <div className="w-14 h-14 bg-white dark:bg-gray-700 rounded-2xl flex items-center justify-center shadow-md group-hover/item:scale-110 transition-all">
                                    <Icon name="paper-plane" className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="font-black text-sm uppercase tracking-tight">Telegram Chat</p>
                                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Відповідь за 5 хв</p>
                                </div>
                            </a>
                            
                            <button
                                onClick={() => {/* Callback Link */}}
                                className="w-full flex items-center gap-6 bg-slate-50 hover:bg-green-600 dark:bg-gray-800 dark:hover:bg-green-600 p-5 rounded-[2.5rem] transition-all group/item text-gray-900 dark:text-white hover:text-white text-left shadow-sm hover:shadow-xl hover:shadow-green-500/20"
                            >
                                <div className="w-14 h-14 bg-white dark:bg-gray-700 rounded-2xl flex items-center justify-center shadow-md group-hover/item:scale-110 transition-all">
                                    <Icon name="phone" className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="font-black text-sm uppercase tracking-tight">{t('support.callback')}</p>
                                    <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">Зателефонуємо зараз</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="mt-10 pt-8 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center opacity-40">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Knowledge Center</span>
                        <span className="text-[10px] font-bold uppercase text-gray-400">09:00 - 18:00</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
