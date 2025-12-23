import React from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { Document, Category, DocumentContent } from '@shared/types';
import { Language, useI18n } from '@app/providers/i18n/i18n';
import { Icon } from '@shared/ui/icons';
import { DocumentView } from '@widgets/DocumentView';
import { useAuth } from '@app/providers/AuthProvider';
import { useDocumentManagement } from '@/shared/hooks/useDocumentManagement';
import { canViewDocument } from '@shared/lib/permissions/permissions';

interface DocumentPageProps {
    documents: Document[];
    categories: Category[];
    onUpdateContent: (docId: string, lang: Language, newContent: DocumentContent) => Promise<void>;
    onRequireLogin: () => void;
    onLoginClick: () => void;
    onRegisterClick: () => void;
    onCategorySelect: (key: string) => void;
}

export const DocumentPage: React.FC<DocumentPageProps> = ({
    documents = [],
    categories = [],
    onUpdateContent,
    onRequireLogin,
    onLoginClick,
    onRegisterClick,
    onCategorySelect
}) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useI18n();
    const { user: currentUser, role: currentUserRole, isLoading: isAuthLoading } = useAuth();
    
    const { allTags, isLoading: isDocsLoading } = useDocumentManagement();

    const docItem = (documents || []).find((d) => d.id === id);

    if (isAuthLoading || isDocsLoading) {
      return (
        <div className="flex items-center justify-center h-[80vh]">
          <Icon name="loading" className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
      );
    }

    if (!docItem) return <Navigate to="/" />;

    const hasAccess = canViewDocument(currentUserRole, docItem, categories);
    const isGuest = currentUserRole === 'guest';
    
    const cat = (categories || []).find((c) => c.nameKey === docItem.categoryKey);
    // 🔥 Added 'worker' to display roles
    const displayRoles = (cat?.viewPermissions || docItem.viewPermissions || [])
        .filter(r => r !== 'admin' && r !== 'guest' && (r === 'foreman' || r === 'engineer' || r === 'architect' || r === 'worker'));

    return (
      <div className="relative min-h-screen">
        <div className={!hasAccess ? "blur-2xl pointer-events-none select-none transition-all duration-700 opacity-50" : "transition-all duration-700"}>
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
            hasAccess={hasAccess}
          />
        </div>

        {!hasAccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray-950/40 backdrop-blur-md animate-fade-in">
            <div className="bg-white dark:bg-gray-900 p-8 md:p-12 rounded-[40px] shadow-2xl border border-white/10 max-w-xl w-full text-center relative overflow-hidden">
              
              <button 
                onClick={() => navigate('/')}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"
                title={t('common.cancel')}
              >
                <Icon name="x-mark" className="w-6 h-6" />
              </button>

              <div className="mx-auto mb-8 w-20 h-20 rounded-3xl bg-blue-600/10 flex items-center justify-center">
                <Icon
                  name={isGuest ? 'lock-closed' : 'clock'}
                  className="w-10 h-10 text-blue-600 dark:text-blue-400"
                />
              </div>

              {isGuest ? (
                <>
                  <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4">
                    {t('docView.accessDenied')}
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
                    {t('docView.accessRequiredGeneric')}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={onLoginClick}
                      className="py-5 bg-blue-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all"
                    >
                      {t('header.login')}
                    </button>
                    <button
                      onClick={onRegisterClick}
                      className="py-5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-black uppercase tracking-widest rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                    >
                      {t('registrationModal.title')}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4">
                    {t('docView.accessPendingTitle')}
                  </h1>
                  
                  {displayRoles.length > 0 ? (
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
                      {t('docView.accessRequiredForRoles', {
                        roles: displayRoles.map((r) => t(`roles.${r}`)).join(', ')
                      })}
                    </p>
                  ) : (
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
                      {t('docView.accessPendingDescription')}
                    </p>
                  )}

                  <button
                    onClick={() => navigate('/')}
                    className="w-full py-5 bg-blue-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all"
                  >
                    {t('docView.backToList')}
                  </button>
                </>
              )}

              <button
                onClick={() => navigate('/')}
                className="mt-8 text-sm font-bold text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest flex items-center justify-center gap-2 mx-auto"
              >
                <Icon name="chevron-left" className="w-4 h-4" />
                {t('docView.backToList')}
              </button>
            </div>
          </div>
        )}
      </div>
    );
};
