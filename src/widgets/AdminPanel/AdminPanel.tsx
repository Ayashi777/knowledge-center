import React, { useState, useEffect } from 'react';
import { Category, Document, Tag, UserProfile } from '@shared/types';
import { UsersApi } from '@shared/api/firestore/users.api';
import { TagEditorModal } from '@widgets/modals/TagEditorModal';
import { UserEditorModal } from '@widgets/modals/UserEditorModal';

// Sub-components
import { AdminHeader } from './ui/AdminHeader';
import { AdminTabs } from './ui/AdminTabs';
import { ContentTab } from './ui/ContentTab';
import { TagsTab } from './ui/TagsTab';
import { UsersTab } from './ui/UsersTab';

interface AdminPanelProps {
  categories: Category[];
  documents: Document[];
  allTags: Tag[];
  onUpdateCategory: (cat: Category) => void;
  onDeleteCategory: (id: string) => void;
  onAddCategory: () => void;
  onDeleteDocument: (id: string) => void;
  onEditDocument: (doc: Document) => void;
  onAddDocument: () => void;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  categories,
  documents,
  allTags,
  onUpdateCategory,
  onDeleteCategory,
  onAddCategory,
  onDeleteDocument,
  onEditDocument,
  onAddDocument,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'users' | 'tags'>('content');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (activeTab === 'users') {
      const unsub = UsersApi.subscribeUsers((updatedUsers) => {
        setUsers(updatedUsers);
      });
      return () => unsub();
    }
  }, [activeTab]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700/50 overflow-hidden animate-slide-up">
      <AdminHeader onClose={onClose} />
      <AdminTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="p-8 min-h-[500px]">
        {activeTab === 'content' && (
          <ContentTab 
            categories={categories}
            documents={documents}
            onAddCategory={onAddCategory}
            onUpdateCategory={onUpdateCategory}
            onDeleteCategory={onDeleteCategory}
            onAddDocument={onAddDocument}
            onEditDocument={onEditDocument}
            onDeleteDocument={onDeleteDocument}
          />
        )}

        {activeTab === 'tags' && (
          <TagsTab 
            allTags={allTags}
            onAddTag={() => setEditingTag({ id: '', color: '#3b82f6' })}
            onEditTag={setEditingTag}
          />
        )}

        {activeTab === 'users' && (
          <UsersTab 
            users={users}
            onEditUser={setEditingUser}
          />
        )}
      </div>

      {editingTag && (
        <TagEditorModal
          tag={editingTag}
          onClose={() => setEditingTag(null)}
          onSave={async () => setEditingTag(null)}
        />
      )}
      {editingUser && (
        <UserEditorModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={async () => setEditingUser(null)}
        />
      )}
    </div>
  );
};
