import { formatDistanceToNow } from 'date-fns';
import { uk, enUS } from 'date-fns/locale';
import { Language } from '../../../i18n';

export const formatDistance = (date: Date, lang: Language) => {
  return formatDistanceToNow(date, {
    addSuffix: true,
    locale: lang === 'uk' ? uk : enUS,
  });
};
