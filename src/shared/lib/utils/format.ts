import { formatDistanceToNow } from 'date-fns';
import { uk, enUS } from 'date-fns/locale';
import { Language } from '@shared/types';
import { Timestamp } from 'firebase/firestore';

/**
 * Форматує дату як відносну (наприклад, "2 дні тому")
 */
export const formatDistance = (date: Date | number, lang: Language) => {
  let locale = uk;
  if (lang === 'en') locale = enUS;

  return formatDistanceToNow(date, {
    addSuffix: true,
    locale: locale,
  });
};

/**
 * Спеціалізована функція для документів, що обробляє Firestore Timestamp
 */
export const formatRelativeTime = (updatedAt: Timestamp | Date | number | null | undefined, lang: Language) => {
    if (!updatedAt) return '—';
    
    try {
        let date: Date;
        
        if (updatedAt instanceof Timestamp) {
            date = updatedAt.toDate();
        } else if (updatedAt instanceof Date) {
            date = updatedAt;
        } else {
            date = new Date(updatedAt);
        }
        
        if (isNaN(date.getTime())) return '—';

        return formatDistance(date, lang);
    } catch (e) {
        console.error('[formatRelativeTime] Error formatting date:', e);
        return '—';
    }
};

/**
 * Нормалізує ключ категорії (видаляє префікс 'categories.' якщо він є)
 */
export const normalizeCategoryKey = (key: string | null | undefined): string => {
  if (!key) return '';
  return key.startsWith('categories.') ? key.replace('categories.', '') : key;
};

/**
 * Локалізує назву категорії з підтримкою обох форматів ключів
 */
export const getCategoryName = (key: string | null | undefined, t: (key: string) => string): string => {
  if (!key) return '—';
  
  const normalized = normalizeCategoryKey(key);
  const i18nKey = `categories.${normalized}`;
  const translated = t(i18nKey);
  
  // Якщо переклад не знайшовся (i18next повертає сам ключ), пробуємо сирий ключ
  if (translated === i18nKey) {
      return t(key);
  }
  
  return translated;
};
