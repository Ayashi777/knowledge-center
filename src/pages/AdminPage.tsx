import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Category, Document, Tag } from '../shared/types';
import { AdminPanel } from '../widgets/AdminPanel';
import { Icon } from '../shared/ui/icons';
import { useAuth } from '../app/providers/AuthProvider';

interface AdminPageProps {
    isDocsLoading: boolean;
    categories: Category[];
    documents: Document[];
    allTags: Tag[];
    onUpdateCategory: (cat: Category) => void;
    onDeleteCategory: (id: string) => void;
    onAddCategory: () => void;
    onDeleteDocument: (id: string) => void;
    onEditDocument: (doc: Document) => void;
    onAddDocument: () => void;
    onLoginClick: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
    isDocsLoading,
    categories,
    documents,
    allTags,
    onUpdateCategory,
    onDeleteCategory,
    onAddCategory,
    onDeleteDocument,
    onEditDocument,
    onAddDocument,
    onLoginClick
}) => {
    const navigate = useNavigate();
    const { role: currentUserRole, isLoading: isAuthLoading } = useAuth();
    const showAdminControls = currentUserRole === 'admin';

    if (isAuthLoading || isDocsLoading) {
      return (
        <div className="flex items-center justify-center h-[80vh]">
          <Icon name="loading" className="w-10 h-10 text-blue-600" />
        </div>
      );
    }

    if (!showAdminControls) {
      return (
        <div className="pt-32 text-center animate-fade-in">
          <Icon name="cog" className="mx-auto mb-6 text-gray-300 w-16 h-16" />
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
            Зона Адміністратора
          </h2>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            Будь ласка, авторизуйтесь з правами адміністратора для доступу до
            інструментів керування.
          </p>
          <button
            onClick={onLoginClick}
            className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all uppercase tracking-widest text-xs"
          >
            Вхід для Адміна
          </button>
        </div>
      );
    }

    return (
      <AdminPanel
        categories={categories}
        documents={documents}
        allTags={allTags}
        onUpdateCategory={onUpdateCategory}
        onDeleteCategory={onDeleteCategory}
        onAddCategory={onAddCategory}
        onDeleteDocument={onDeleteDocument}
        onEditDocument={onEditDocument}
        onAddDocument={onAddDocument}
        onClose={() => navigate('/')}
      />
    );
};
