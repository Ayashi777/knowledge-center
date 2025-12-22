import { formatDistanceToNow } from 'date-fns';
import { uk, it } from 'date-fns/locale';
import { Language } from '@shared/types';

/**
 * Форматує дату як відносну (наприклад, "2 дні тому")
 */
export const formatDistance = (date: Date | number, lang: Language) => {
  return formatDistanceToNow(date, {
    addSuffix: true,
    locale: lang === 'uk' ? uk : it,
  });
};

/**
 * Спеціалізована функція для документів, що обробляє Firestore Timestamp
 */
export const formatRelativeTime = (updatedAt: any, lang: Language, t?: (key: string) => string) => {
    if (!updatedAt) return '—';
    
    try {
        // Обробка Firestore Timestamp
        const date = updatedAt.toDate ? updatedAt.toDate() : new Date(updatedAt);
        
        if (isNaN(date.getTime())) return '—';

        return formatDistance(date, lang);
    } catch (e) {
        console.error('Error formatting date:', e);
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
  
  // Пробуємо знайти переклад з префіксом (новий стандарт)
  const translated = t(`categories.${normalized}`);
  
  // Якщо переклад не знайшовся (повернувся сам ключ), пробуємо сирий ключ (зворотна сумісність)
  if (translated === `categories.${normalized}`) {
      return t(key);
  }
  
  return translated;
};
