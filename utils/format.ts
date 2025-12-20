import { Language } from '../i18n';

export function formatRelativeTime(dateInput: any, lang: Language, t: (key: string) => string): string {
    // 1. Convert Timestamp or string or Date to a JS Date object
    let date: Date;
    
    if (!dateInput) return ''; 

    if (dateInput.toDate && typeof dateInput.toDate === 'function') {
        date = dateInput.toDate(); // Firestore Timestamp
    } else if (dateInput instanceof Date) {
        date = dateInput;
    } else {
        date = new Date(dateInput); // JS string or number
    }

    // 2. Check for invalid date
    if (isNaN(date.getTime())) return '';

    const now = new Date();
    const diffSeconds = Math.round((date.getTime() - now.getTime()) / 1000);

    const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });

    if (Math.abs(diffSeconds) < 60) {
        return t('common.justNow');
    }
    
    const diffMinutes = Math.round(diffSeconds / 60);
    if (Math.abs(diffMinutes) < 60) {
        return rtf.format(diffMinutes, 'minute');
    }

    const diffHours = Math.round(diffMinutes / 60);
    if (Math.abs(diffHours) < 24) {
        return rtf.format(diffHours, 'hour');
    }
    
    const diffDays = Math.round(diffHours / 24);
    if (Math.abs(diffDays) < 30) {
        return rtf.format(diffDays, 'day');
    }

    const diffMonths = Math.round(diffDays / 30);
    if(Math.abs(diffMonths) < 12) {
        return rtf.format(diffMonths, 'month');
    }
    
    const diffYears = Math.round(diffMonths/12);
    return rtf.format(diffYears, 'year');
}
