import React, { useState } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { Document, Category, UserRole, DocumentContent, Tag } from '../types';
import { useI18n, Language } from '../i18n';
import { Icon } from '../components/icons';
import { DocumentView } from '../widgets/DocumentView';
import { User } from 'firebase/auth';

interface DocumentPageProps {
    documents: Document[];
    categories: Category[];
    currentUserRole: UserRole;
    currentUser: User | null;
    isAuthLoading: boolean;
    isDocsLoading: boolean;
    allTags: Tag[];
    onUpdateContent: (docId: string, lang: Language, newContent: DocumentContent) => Promise<void>;
    onRequireLogin: () => void;
    onLoginClick: () => void;
    onRegisterClick: () => void;
    onCategorySelect: (key: string) => void;
}

export const DocumentPage: React.FC<DocumentPageProps> = ({
    documents,
    categories,
    currentUserRole,
    currentUser,
    isAuthLoading,
    isDocsLoading,
    allTags,
    onUpdateContent,
    onRequireLogin,
    onLoginClick,
    onRegisterClick,
    onCategorySelect
}) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useI18n();

    const docItem = documents.find((d) => d.id === id);

    if (isAuthLoading || isDocsLoading) {
      return (
        <div className="flex items-center justify-center h-[80vh]">
          <Icon name="loading" className="w-10 h-10 text-blue-600" />
        </div>
      );
    }

    if (!docItem) return <Navigate to="/" />;

    const cat = categories.find((c) => c.nameKey === docItem.categoryKey);
    const hasAccess = cat?.viewPermissions?.includes(currentUserRole);

    if (hasAccess) {
      return (
        <DocumentView
          doc={docItem}
          allTags={allTags}
          onClose={() => navigate('/')}
          onRequireLogin={onRequireLogin}
          currentUserRole={currentUserRole}
          onUpdateContent={onUpdateContent}
          onCategoryClick={(key) => {
            onCategorySelect(key);
            navigate('/');
          }}
        />
      );
    }

    // Filter out 'admin' from public display roles
    const displayRoles = (cat?.viewPermissions || []).filter(r => r !== 'admin' && r !== 'guest');
    const isGuest = !!currentUser && currentUserRole === 'guest';

    return (
      <div className="pt-32 text-center animate-fade-in px-4">
        <div className="text-center w-full max-w-lg mx-auto">
          {(() => {
            return (
              <>
                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <Icon
                    name={isGuest ? 'clock' : 'lock-closed'}
                    className="w-8 h-8 text-yellow-500 dark:text-yellow-400"
                  />
                </div>

                {isGuest ? (
                  <>
                    {/* === Стан для Гостя (заявка надіслана) === */}
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {t('docView.accessPendingTitle')}
                    </h1>

                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                      {t('docView.accessPendingDescription')}
                    </p>

                    <div className="mt-8">
                      <button
                        onClick={() => navigate('/')}
                        className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {t('docView.backToList')}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* === Стан для незалогіненого користувача === */}
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {t('docView.accessDenied')}
                    </h1>

                    {displayRoles.length > 0 ? (
                      <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                        Цей документ призначений для ролі{' '}
                        <strong className="text-gray-900 dark:text-white">
                          {displayRoles.map((r) => t(`roles.${r}`)).join(', ')}
                        </strong>
                        .
                        <br />
                        Будь ласка, увійдіть або зареєструйтесь, щоб отримати доступ.
                      </p>
                    ) : (
                      <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                        Цей документ має обмежений рівень доступу.
                        <br />
                        Будь ласка, увійдіть або зареєструйтесь, щоб отримати доступ.
                      </p>
                    )}

                    <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                      <button
                        onClick={onLoginClick}
                        className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {t('header.login')}
                      </button>

                      <button
                        onClick={onRegisterClick}
                        className="px-8 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        {t('registrationModal.title')}
                      </button>
                    </div>

                    <button
                      onClick={() => navigate('/')}
                      className="mt-10 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      ...або повернутись до списку
                    </button>
                  </>
                )}
              </>
            );
          })()}
        </div>
      </div>
    );
};
