import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { UserRole } from '@shared/types';
import { useI18n } from '@app/providers/i18n/i18n';
import { Icon } from '@shared/ui/icons';
import { logout } from '@shared/api/firebase/auth';
import { Button } from '@shared/ui/primitives';

export const UserAccessControl: React.FC<{
  user: User | null;
  role: UserRole;
  onLoginClick: () => void;
}> = ({ user, role, onLoginClick }) => {
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-3">
      {/* Desktop/Tablet */}
      <div className="hidden sm:flex flex-col text-right">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-fg">
          {user ? user.email : t('roles.guest')}
        </span>
        <div className="flex items-center justify-end gap-2">
          <span className="text-xs font-black uppercase tracking-tighter text-primary">
            {t(`roles.${role}`)}
          </span>
          {user && (
            <Button
              onClick={() => logout()}
              variant="ghost"
              className="h-auto p-0 text-[10px] font-black uppercase tracking-tighter text-danger hover:underline"
            >
              {t('header.logout')}
            </Button>
          )}
        </div>
      </div>

      {/* Mobile */}
      <div className="sm:hidden flex items-center gap-2">
        {user ? (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-black text-primary-fg">
            {(user.email || 'U').charAt(0).toUpperCase()}
          </div>
        ) : (
          <Button
            onClick={onLoginClick}
            size="icon"
            className="h-9 w-9 rounded-xl"
            aria-label={t('header.login')}
          >
            <Icon name="user" className="w-4 h-4" />
          </Button>
        )}
      </div>

      {role === 'admin' && (
        <Button
          onClick={() => navigate('/admin')}
          size="icon"
          className="hidden h-10 w-10 rounded-xl sm:flex"
          title={t('header.adminPanel')}
        >
          <Icon name="cog" className="w-5 h-5" />
        </Button>
      )}

      {!user && (
        <Button
          onClick={onLoginClick}
          className="hidden h-10 rounded-xl px-5 text-xs font-black uppercase tracking-widest sm:flex"
        >
          {t('header.login')}
        </Button>
      )}
    </div>
  );
};
