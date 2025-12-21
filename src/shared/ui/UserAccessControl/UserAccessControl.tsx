import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { UserRole } from '../../types';
import { useI18n } from '../../i18n';
import { Icon } from '../../components/icons';
import { logoutUser } from '../../utils/auth';

export const UserAccessControl: React.FC<{
  user: User | null;
  role: UserRole;
  onLoginClick: () => void;
}> = ({ user, role, onLoginClick }) => {
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col text-right">
        <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest">
          {user ? user.email : t('roles.guest')}
        </span>
        <div className="flex items-center justify-end gap-2">
          <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-tighter">
            {t(`roles.${role}`)}
          </span>
          {user && (
            <button
              onClick={() => logoutUser()}
              className="text-[10px] text-red-500 hover:underline font-black uppercase tracking-tighter"
            >
              {t('header.logout')}
            </button>
          )}
        </div>
      </div>

      {role === 'admin' && (
        <button
          onClick={() => navigate('/admin')}
          className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30"
          title={t('header.adminPanel')}
        >
          <Icon name="cog" className="w-5 h-5" />
        </button>
      )}

      {!user && (
        <button
          onClick={onLoginClick}
          className="px-5 py-2.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-500/20 uppercase tracking-widest"
        >
          {t('header.login')}
        </button>
      )}
    </div>
  );
};
